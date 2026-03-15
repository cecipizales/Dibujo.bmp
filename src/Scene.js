import React, { useState, useEffect } from 'react';
import WinXP from 'WinXP';

// ─── Canvas dimensions ────────────────────────────────────────────────────────
const W = 1920;
const H = 1080;

// ─── Monitor screen area (pixel coords within the 1920×1080 canvas) ───────────
// These are calibrated from Screen-goes-here.png reference layer.
// !! Set DEBUG_SCREEN = true to show the reference overlay for calibration !!
const DEBUG_SCREEN = true;

const SCREEN = {
  left:   610,
  top:    160,
  width:  694,
  height: 522,
};

function Scene() {
  const [pos, setPos] = useState({ scale: 1, x: 0, y: 0 });

  useEffect(() => {
    function calc() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min(vw / W, vh / H);
      const x = (vw - W * scale) / 2;
      const y = (vh - H * scale) / 2;
      setPos({ scale, x, y });
    }
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const { scale, x, y } = pos;

  return (
    <div style={{
      width:    '100vw',
      height:   '100vh',
      overflow: 'hidden',
      position: 'relative',
      background: '#111',
    }}>
      <div style={{
        position:        'absolute',
        top:             y,
        left:            x,
        width:           W,
        height:          H,
        transformOrigin: 'top left',
        transform:       `scale(${scale})`,
      }}>

        {/* ── z1: Desk / room background ─────────────────────────────── */}
        <img src="/setup/BG-base.png" alt="" draggable={false} style={fullLayer(1)} />

        {/* ── z2: Monitor frame ──────────────────────────────────────── */}
        <img src="/setup/Monitor.png" alt="Monitor" draggable={false} style={fullLayer(2)} />

        {/* ── z3: WinXP inside screen area ───────────────────────────── */}
        <div style={{
          position: 'absolute',
          left:     SCREEN.left,
          top:      SCREEN.top,
          width:    SCREEN.width,
          height:   SCREEN.height,
          overflow: 'hidden',
          zIndex:   3,
        }}>
          <WinXP />
        </div>

        {/* ── z4: Keyboard ───────────────────────────────────────────── */}
        <img src="/setup/keyboard.png" alt="" draggable={false} style={fullLayer(4)} />

        {/* ── z5: Left speaker ───────────────────────────────────────── */}
        <img src="/setup/Speaker-left.png" alt="" draggable={false} style={fullLayer(5)} />

        {/* ── z6: Right speaker ──────────────────────────────────────── */}
        <img src="/setup/Speaker-right.png" alt="" draggable={false} style={fullLayer(6)} />

        {/*
          ── DEBUG: Screen-goes-here reference overlay (remove when aligned) ──
          Shows the exact screen boundary from the reference PNG.
          The red border box shows where code currently places WinXP.
          When the two align, coordinates are correct.
        */}
        {DEBUG_SCREEN && (
          <>
            {/* Reference image: shows where screen SHOULD be */}
            <img
              src="/setup/Screen-goes-here.png"
              alt="debug"
              draggable={false}
              style={{ ...fullLayer(10), opacity: 0.5 }}
            />
            {/* Red box: shows where WinXP IS being placed */}
            <div style={{
              position: 'absolute',
              left:     SCREEN.left,
              top:      SCREEN.top,
              width:    SCREEN.width,
              height:   SCREEN.height,
              border:   '3px solid red',
              zIndex:   11,
              pointerEvents: 'none',
              boxSizing: 'border-box',
            }} />
          </>
        )}

      </div>
    </div>
  );
}

function fullLayer(zIndex) {
  return {
    position:      'absolute',
    top:           0,
    left:          0,
    width:         W,
    height:        H,
    zIndex,
    userSelect:    'none',
    pointerEvents: 'none',
    display:       'block',
  };
}

export default Scene;
