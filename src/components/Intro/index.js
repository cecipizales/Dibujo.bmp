import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Intro = ({ onFinish }) => {
  const [phase, setPhase] = useState('start'); // 'start', 'today', 'rewind', 'video'
  const [fading, setFading] = useState(false);
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
      // Waiting for user to click
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

  const safeFinish = () => {
    if (!introFinishedRef.current) {
      introFinishedRef.current = true;
      onFinish();
    }
  };

  // Attempt to play video precisely when phase switches to 'video'
  useEffect(() => {
    if (phase === 'video' && videoRef.current) {
      // Extremely strict fallback: if the video phase starts, give the browser
      // a strict 6 second window to render the video. If the video hangs or is blocked
      // and doesn't finish, jump to desktop automatically.
      const fallbackTimer = setTimeout(() => {
        console.warn('Video fallback timeout triggered (took too long or hung)');
        safeFinish();
      }, 6000);

      try {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Auto-play was blocked or failed during phase video:", error);
            // Wait just a moment so it doesn't jarringly snap to desktop if blocked
            setTimeout(() => { safeFinish(); }, 300);
          });
        }
      } catch (err) {
        console.error("Video play threw sync error:", err);
        safeFinish();
      }

      return () => clearTimeout(fallbackTimer);
    }
  }, [phase, onFinish]);

  const handleVideoEnd = () => {
    console.log("Video ended normally.");
    safeFinish();
  };

  const handleVideoError = () => {
    console.error("Video failed to load completely.");
    safeFinish();
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      // Trigger a smooth fade out visual transition during the final 1.2 seconds of the video
      if (duration && (duration - currentTime) <= 1.2 && !fading) {
        setFading(true);
        // Also fade out the volume smoothly on compatible browsers
        try {
          let vol = videoRef.current.volume;
          const fadeInterval = setInterval(() => {
            if (!videoRef.current) return clearInterval(fadeInterval);
            vol -= 0.1;
            if (vol <= 0) {
              videoRef.current.volume = 0;
              clearInterval(fadeInterval);
            } else {
              videoRef.current.volume = vol;
            }
          }, 100);
        } catch(e) {}
      }
    }
  };

  const startSequence = () => {
    if (phase === 'start') {
      // Force Apple/Safari to authorize the media element immediately inside the touch handler
      if (videoRef.current) {
        try {
          videoRef.current.load();
        } catch(e) {}
      }
      setPhase('today');
    }
  };

  return (
    <IntroContainer $fade={fading}>
      {/* Absolute skip button to let them escape if they want */}
      {phase !== 'start' && (
        <SkipButton onClick={safeFinish}>[ SKIP INTRO ]</SkipButton>
      )}

      {/* Center content */}
      {phase === 'start' && (
        <StartPrompt onClick={startSequence}>
          [ CLICK TO INITIATE SEQUENCE ]
        </StartPrompt>
      )}
      {(phase === 'today' || phase === 'rewind') && (
        <DateDisplay>
          {displayDate}
        </DateDisplay>
      )}

      {/* The video uses z-index and pointer-events to hide securely */}
      <VideoPlayer
        ref={videoRef}
        src="/load-desktop-animation.mp4"
        playsInline
        webkit-playsinline="true"
        preload="auto"
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        onTimeUpdate={handleVideoTimeUpdate}
        style={{
          opacity: phase === 'video' ? 1 : 0,
          pointerEvents: phase === 'video' ? 'auto' : 'none',
          zIndex: phase === 'video' ? 10 : -10
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
  opacity: ${props => props.$fade ? 0 : 1};
  transition: opacity 1.2s ease-out;
`;

const SkipButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: transparent;
  border: none;
  font-family: 'Courier New', Courier, monospace;
  color: #555;
  font-size: 14px;
  cursor: pointer;
  z-index: 100;

  &:hover {
    color: #fff;
  }
`;

const StartPrompt = styled.button`
  background: transparent;
  border: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 2vw;
  color: #888;
  letter-spacing: 0.2em;
  animation: pulse 1.5s infinite;
  cursor: pointer;
  z-index: 50;

  &:hover {
    color: #fff;
    animation: none;
  }

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
  z-index: 50;
  
  @media (max-width: 768px) {
    font-size: 8vw;
  }
`;

const VideoPlayer = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  background-color: #000;
`;

export default Intro;
