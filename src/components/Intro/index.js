import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Intro = ({ onFinish }) => {
  const [phase, setPhase] = useState('today'); // 'today', 'rewind', 'video'
  const [displayDate, setDisplayDate] = useState('');
  const videoRef = useRef(null);

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

    if (phase === 'today') {
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

  const handleVideoEnd = () => {
    onFinish();
  };

  return (
    <IntroContainer>
      {(phase === 'today' || phase === 'rewind') && (
        <DateDisplay>{displayDate}</DateDisplay>
      )}
      {phase === 'video' && (
        <VideoPlayer
          ref={videoRef}
          src="/load-desktop-animation.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
        />
      )}
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
`;

const DateDisplay = styled.div`
  font-family: 'Courier New', Courier, monospace;
  font-size: 8vw;
  color: #0f0;
  text-shadow: 0 0 15px #0f0, 0 0 5px #0f0;
  letter-spacing: 0.1em;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 15vw;
  }
`;

const VideoPlayer = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #000;
`;

export default Intro;
