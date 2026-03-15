import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import PictureViewer from '../PictureViewer';

// All the images available on this "computer"
const RECENT_FILES = [
  { name: 'Dibujo  CECILIA.bmp', url: '/images/Dibujo  CECILIA.png' },
  { name: 'Dibujo cumple.bmp',   url: '/images/Dibujo cumple.png'   },
  { name: 'PAint 13.bmp',        url: '/images/PAint 13.png'        },
  { name: 'Paint 1.bmp',         url: '/images/Paint 1.png'         },
  { name: 'Paint 5.bmp',         url: '/images/Paint 5.png'         },
  { name: 'Paint 6.bmp',         url: '/images/Paint 6.png'         },
  { name: 'Paint 9.bmp',         url: '/images/Paint 9.png'         },
  { name: 'Paint 10.bmp',        url: '/images/Paint 10.png'        },
  { name: 'Paint 12.bmp',        url: '/images/Paint 12.png'        },
  { name: 'Painttt.bmp',         url: '/images/Painttt.png'         },
];

function Paint({ onClose, isFocus }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openImage, setOpenImage] = useState(null); // { name, url }
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleOpenRecent(file) {
    setOpenImage(file);
    setMenuOpen(false);
  }

  function handleCloseImage() {
    setOpenImage(null);
  }

  return (
    <Wrapper>
      {/* Custom menu bar sitting above the iframe */}
      <MenuBar ref={menuRef}>
        <MenuLabel onClick={() => setMenuOpen(o => !o)}>File</MenuLabel>
        {menuOpen && (
          <Dropdown>
            <MenuItem disabled>New</MenuItem>
            <MenuItem disabled>Open...</MenuItem>
            <Separator />
            <SubHeader>Open Recent</SubHeader>
            {RECENT_FILES.map(file => (
              <MenuItem key={file.url} onClick={() => handleOpenRecent(file)}>
                📄 {file.name}
              </MenuItem>
            ))}
            <Separator />
            <MenuItem onClick={onClose}>Exit</MenuItem>
          </Dropdown>
        )}
      </MenuBar>

      {/* Paint iframe */}
      <IframeWrapper>
        <iframe
          src="https://jspaint.app"
          frameBorder="0"
          title="paint"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgb(192,192,192)',
          }}
        />
        {!isFocus && <FocusBlocker />}
      </IframeWrapper>

      {/* Overlay picture viewer when a recent file is selected */}
      {openImage && (
        <ImageOverlay>
          <ImageToolbar>
            <span style={{ fontWeight: 'bold', fontSize: 11 }}>
              📄 {openImage.name}
            </span>
            <CloseBtn onClick={handleCloseImage}>✕ Close</CloseBtn>
          </ImageToolbar>
          <PictureViewer imageUrl={openImage.url} />
        </ImageOverlay>
      )}
    </Wrapper>
  );
}

/* ── Styled Components ── */

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MenuBar = styled.div`
  height: 20px;
  background: #d4d0c8;
  border-bottom: 1px solid #808080;
  display: flex;
  align-items: center;
  padding: 0 2px;
  position: relative;
  z-index: 100;
  flex-shrink: 0;
`;

const MenuLabel = styled.div`
  padding: 1px 6px;
  font-size: 11px;
  font-family: Tahoma, sans-serif;
  cursor: pointer;
  user-select: none;
  &:hover {
    background: #0a246a;
    color: white;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  background: #d4d0c8;
  border: 1px solid #808080;
  border-top: none;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  min-width: 200px;
  z-index: 200;
  padding: 2px 0;
`;

const MenuItem = styled.div`
  padding: 3px 20px;
  font-size: 11px;
  font-family: Tahoma, sans-serif;
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
  color: ${({ disabled }) => disabled ? '#808080' : '#000'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover {
    background: ${({ disabled }) => disabled ? 'transparent' : '#0a246a'};
    color: ${({ disabled }) => disabled ? '#808080' : 'white'};
  }
`;

const SubHeader = styled.div`
  padding: 3px 20px 1px;
  font-size: 10px;
  font-family: Tahoma, sans-serif;
  color: #555;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Separator = styled.div`
  height: 1px;
  background: #808080;
  margin: 3px 4px;
`;

const IframeWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const FocusBlocker = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  bottom: 0;
  background: #aebfd0;
  display: flex;
  flex-direction: column;
  z-index: 50;
`;

const ImageToolbar = styled.div`
  height: 26px;
  background: #d4d0c8;
  border-bottom: 1px solid #808080;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  flex-shrink: 0;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
`;

const CloseBtn = styled.button`
  font-size: 11px;
  font-family: Tahoma, sans-serif;
  background: #d4d0c8;
  border: 1px solid #808080;
  cursor: pointer;
  padding: 1px 6px;
  &:hover { background: #c0c0c0; }
  &:active { background: #a0a0a0; }
`;

export default Paint;
