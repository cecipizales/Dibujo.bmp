import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Intro = ({ onFinish }) => {
  const [phase, setPhase] = useState('start'); // 'start', 'today', 'rewind', 'video'
  const [displayDate, setDisplayDate] = useState('');
  const videoRef = useRef(null);
  const introFinishedRef = useRef(false);

  useEffect(() => {
    // Format date as MM-DD-YYYY
    const f = d => {
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const y = d.getFullYear();
      return `${m}-${day}-${y}`;
    }

    const today = new Date();
    const targetDate = new Date('2007-10-15T12:00:00');
    setDisplayDate(f(today));

    let timerId;

    if (phase === 'start') {
      // Wait for user interaction to satisfy browser autoplay policies for audio
    } else if (phase === 'today') {
      // Hold on today's date for 2 seconds
      timerId = setTimeout(() => {
        setPhase('rewind');
      }, 2000);
    } else if (phase === 'rewind') {
      let startTime = null;
      const duration = 2500; // 2.5 seconds rewinding

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        let progress = (timestamp - startTime) / duration;
        if (progress > 1) progress = 1;

        // Easing out effect to slow down the rewind as it approaches the target date
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentMs = today.getTime() - easeProgress * (today.getTime() - targetDate.getTime());
        setDisplayDate(f(new Date(currentMs)));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayDate('10-15-2007');
          setTimeout(() => {
            setPhase('video');
          }, 800); // Hold on the final date briefly before playing video
        }
      };
      
      requestAnimationFrame(animate);
    }

    return () => clearTimeout(timerId);
  }, [phase]);

  // Attempt to play video precisely when phase switches to 'video'
  useEffect(() => {
    if (phase === 'video' && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Auto-play was blocked or failed during phase video:", error);
          if (!introFinishedRef.current) {
            introFinishedRef.current = true;
            onFinish(); // Instantly skip if video gets blocked
          }
        });
      }
    }
  }, [phase, onFinish]);

  const safeFinish = () => {
    if (!introFinishedRef.current) {
      introFinishedRef.current = true;
      onFinish();
    }
  };

  const handleVideoEnd = () => {
    console.log("Video ended normally.");
    safeFinish();
  };

  const handleVideoError = () => {
    console.error("Video failed to load completely.");
    safeFinish();
  };

  const handleSkip = () => {
    if (phase === 'start') {
      // Direct user action tick.
      // We UNLOCK the video element here so it's allowed to play unmuted later.
      if (videoRef.current) {
        videoRef.current.play().then(() => {
          // Immediately pause it, we just wanted to unlock it and buffer
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }).catch(err => {
          console.warn("Pre-play unlock failed, but continuing:", err);
        });
      }
      setPhase('today'); // Initial click starts the animation
    } else {
      safeFinish(); // Any subsequent click skips the intro completely
    }
  };

  return (
    <IntroContainer onClick={handleSkip}>
      {phase === 'start' && (
        <StartPrompt>[ CLICK TO INITIATE SEQUENCE ]</StartPrompt>
      )}
      {(phase === 'today' || phase === 'rewind') && (
        <DateDisplay>
          {displayDate}
        </DateDisplay>
      )}
      <VideoPlayer
        ref={videoRef}
        src="/load-desktop-animation.mp4"
        playsInline
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        style={{
          opacity: phase === 'video' ? 1 : 0,
          pointerEvents: phase === 'video' ? 'auto' : 'none',
          position: phase === 'video' ? 'relative' : 'absolute'
        }}
      />
    </IntroContainer>
  );
};

const IntroContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
  overflow: hidden;
  cursor: pointer; /* Signal to user that they can click to skip */
`;

const StartPrompt = styled.div`
  font-family: 'Courier New', Courier, monospace;
  font-size: 2vw;
  color: #888;
  letter-spacing: 0.2em;
  animation: pulse 1.5s infinite;

  @media (max-width: 768px) {
    font-size: 4vw;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
`;

const DateDisplay = styled.div`
  font-family: 'Courier New', Courier, monospace;
  font-size: 5vw;
  color: #e0e0e0;
  letter-spacing: 0.15em;
  font-weight: normal;
  
  @media (max-width: 768px) {
    font-size: 8vw;
  }
`;

const VideoPlayer = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #000;
`;

export default Intro;
