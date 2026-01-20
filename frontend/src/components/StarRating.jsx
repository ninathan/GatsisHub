import React from 'react';
import styled from 'styled-components';

const StarRating = ({ rating = 5, readOnly = true, onChange, size = 35 }) => {
  return (
    <StyledWrapper size={size}>
      <div className="rating">
        <input 
          value={5} 
          name="rating" 
          id="star5" 
          type="radio" 
          checked={rating === 5}
          onChange={(e) => onChange && onChange(5)}
          disabled={readOnly}
        />
        <label title="5 stars" htmlFor="star5">
          <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#000000" fill="none" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg" className="svgOne">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#000000" fill="none" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg" className="svgTwo">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <div className="ombre" />
        </label>
        <input 
          value={4} 
          name="rating" 
          id="star4" 
          type="radio" 
          checked={rating === 4}
          onChange={(e) => onChange && onChange(4)}
          disabled={readOnly}
        />
        <label title="4 stars" htmlFor="star4">
          <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#000000" fill="none" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg" className="svgOne">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#000000" fill="none" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg" className="svgTwo">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <div className="ombre" />
        </label>
        <input 
          value={3} 
          name="rating" 
          id="star3" 
          type="radio" 
          checked={rating === 3}
          onChange={(e) => onChange && onChange(3)}
          disabled={readOnly}
        />
        <label title="3 stars" htmlFor="star3">
          <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#000000" fill="none" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg" className="svgOne">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#000000" fill="none" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg" className="svgTwo">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <div className="ombre" />
        </label>
        <input 
          value={2} 
          name="rating" 
          id="star2" 
          type="radio" 
          checked={rating === 2}
          onChange={(e) => onChange && onChange(2)}
          disabled={readOnly}
        />
        <label title="2 stars" htmlFor="star2">
          <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#000000" fill="none" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg" className="svgOne">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#000000" fill="none" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg" className="svgTwo">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <div className="ombre" />
        </label>
        <input 
          value={1} 
          name="rating" 
          id="star1" 
          type="radio" 
          checked={rating === 1}
          onChange={(e) => onChange && onChange(1)}
          disabled={readOnly}
        />
        <label title="1 star" htmlFor="star1">
          <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#000000" fill="none" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg" className="svgOne">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth={2} stroke="#000000" fill="none" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg" className="svgTwo">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <div className="ombre" />
        </label>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .rating {
    display: flex;
    flex-direction: row-reverse;
    gap: 0.3rem;
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  .rating input {
    display: none;
  }

  .rating label .svgOne {
    stroke: #ccc;
    fill: rgba(255, 217, 0, 0);
    transition:
      stroke 0.5s ease,
      fill 0.5s ease;
  }

  .rating label .svgTwo {
    position: absolute;
    top: -1px;
    fill: gold;
    stroke: rgba(255, 217, 0, 0);
    opacity: 0;
    transition:
      stroke 0.5s ease,
      fill 0.5s ease,
      opacity 0.5s ease;
  }

  .rating label {
    position: relative;
    cursor: ${props => props.readOnly ? 'default' : 'pointer'};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 3px;
    transition: all 0.5s ease;
  }

  /* Étoiles sélectionnées ou survolées */
  .rating label:hover .svgOne,
  .rating label:hover ~ label .svgOne {
    stroke: gold;
  }

  .rating input:checked ~ label .svgOne {
    stroke: #cccccc00;
  }

  .rating input:checked ~ label .svgTwo {
    transform: rotateX(0deg) rotateY(0deg) translateY(0px);
    opacity: 1;
    animation: displayStar 0.5s cubic-bezier(0.75, 0.41, 0.82, 1.2);
  }

  @keyframes displayStar {
    0% {
      transform: rotateX(100deg) rotateY(100deg) translateY(10px);
    }
    100% {
      transform: rotateX(0deg) rotateY(0deg) translateY(0px);
    }
  }

  .ombre {
    background: radial-gradient(
      ellipse closest-side,
      rgba(0, 0, 0, 0.24),
      rgba(0, 0, 0, 0)
    );
    width: ${props => props.size * 0.86}px;
    height: ${props => props.size * 0.23}px;
    opacity: 0;
    transition: opacity 0.6s ease 0.2s;
  }

  /* Étoiles sélectionnées ou survolées */
  .rating label:hover .ombre,
  .rating label:hover ~ label .ombre {
    opacity: 0.3;
  }

  .rating input:checked ~ label .ombre {
    opacity: 1;
  }

  /* Animation de secousse uniquement au hover */
  .rating label:hover .svgTwo:hover {
    animation:
      chackStar 0.6s ease-out,
      displayStar none 1s;
  }

  @keyframes chackStar {
    0% {
      transform: rotate(0deg);
    }
    20% {
      transform: rotate(-20deg);
    }
    50% {
      transform: rotate(20deg);
    }
    80% {
      transform: rotate(-20deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
`;

export default StarRating;
