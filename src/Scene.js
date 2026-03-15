import React, { useState, useEffect } from 'react';
import WinXP from 'WinXP';

// ─── Screen area coordinates within the 1920×1080 canvas ──────────────────────
// Measured from the "Screen goes here.png" reference asset.
// The monitor's transparent screen hole sits at these pixel values.
const SCREEN = {
  left: 566,
  top:  120,
  width:  344,
  height: 263,
};

function Scene() {
  const [scale, setScale] = useState(1);

  // Keep scene scaled to fill the browser viewport at all times
  useEffect(() => {
    function updateScale() {
      const sx = window.innerWidth  / 1920;
      const sy = window.innerHeight / 1080;
      setScale(Math.min(sx, sy));
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    // Outer shell: fills the viewport, centers the composition
    <div style={{
      width:      '100vw',
      height:     '100vh',
      overflow:   'hidden',
      background: '#1a1a1a',
      display:    'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/*
        Inner canvas: always 1920×1080, scaled down/up uniformly.
        All layers are absolutely positioned inside here.
      */}
      <div style={{
        position:        'relative',
        width:           1920,
        height:          1080,
        flexShrink:      0,
        transform:       `scale(${scale})`,
        transformOrigin: 'center center',
      }}>

        {/* ── Layer 1 – Desk / room background ─────────────────────────── */}
        <img
          src="/setup/BG base.png"
          alt=""
          draggable={false}
          style={layerStyle(1)}
        />

        {/* ── Layer 2 – WinXP app, clipped to the monitor screen area ─────
          Sits at z-index 2, directly behind the monitor frame (z-index 3).
          The monitor PNG has a transparent hole where the screen is, so
          the WinXP content shows through perfectly.
        */}
        <div style={{
          position: 'absolute',
          left:     SCREEN.left,
          top:      SCREEN.top,
          width:    SCREEN.width,
          height:   SCREEN.height,
          overflow: 'hidden',
          zIndex:   2,
        }}>
          <WinXP />
        </div>

        {/* ── Layer 3 – Monitor frame (transparent screen = WinXP shows through) */}
        <img
          src="/setup/Monitor.png"
          alt="Monitor"
          draggable={false}
          style={layerStyle(3)}
        />

        {/* ── Layer 4 – Left speaker ────────────────────────────────────── */}
        <img
          src="/setup/Speaker left.png"
          alt=""
          draggable={false}
          style={layerStyle(4)}
        />

        {/* ── Layer 5 – Right speaker ───────────────────────────────────── */}
        <img
          src="/setup/Speaker right.png"
          alt=""
          draggable={false}
          style={layerStyle(5)}
        />

      </div>
    </div>
  );
}

// Every full-canvas layer shares the same base style;
// only z-index differs.
function layerStyle(zIndex) {
  return {
    position: 'absolute',
    top:      0,
    left:     0,
    width:    1920,
    height:   1080,
    zIndex,
    userSelect: 'none',
    pointerEvents: zIndex === 3 ? 'none' : 'auto', // monitor frame is decorative
  };
}

export default Scene;
