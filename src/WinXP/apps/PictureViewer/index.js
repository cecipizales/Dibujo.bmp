import React from 'react';
import styled from 'styled-components';

function PictureViewer({ imageUrl, onClose }) {
  return (
    <Container>
      <Inner>
        <Image src={imageUrl} alt="Viewer" />
      </Inner>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #aebfd0; /* XP default background for Image Viewer */
  overflow: auto;
  padding: 10px;
  box-sizing: border-box;
`;

const Inner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
  background-color: white;
  padding: 0;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
  border: 1px solid #716f64;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
`;

export default PictureViewer;
