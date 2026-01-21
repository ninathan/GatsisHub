import React from 'react';
import styled from 'styled-components';

const Card = ({images = []}) => {
  return (
    <StyledWrapper>
      <div className="card">
        {images.slice(0, 3).map((img, index) => (
          <p key={index}>
            <img src={img} alt={`Slide ${index + 1}`} />
          </p>
        ))}
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  overflow: hidden;

  .card {
    width: 100%;
    height: 300px;
    border-radius: 0.75rem;
    background: linear-gradient(145deg, #333, #000);
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 0.4em;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    @media (min-width: 768px) {
      height: 400px;
    }

    @media (min-width: 1024px) {
      height: 500px;
    }

    @media (min-width: 1280px) {
      height: 600px;
    }
  }

  .card p {
    flex: 1;
    overflow: hidden;
    cursor: pointer;
    border-radius: 8px;
    transition: flex 0.5s;
    background: linear-gradient(145deg, #212121, #000);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .card p:hover {
    flex: 4;
  }

  .card p img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    position: relative;
    z-index: 1;
  }

  .card p::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    z-index: 0;
    transition: opacity 0.5s;
    pointer-events: none;
    opacity: 0;
  }

  .card p:hover::before {
    opacity: 1;
  }`;

export default Card;