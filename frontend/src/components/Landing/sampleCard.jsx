import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import sampleP1 from '../../images/sample1.png';
import sampleP2 from '../../images/sample2.png';
import sampleP3 from '../../images/sample3.png';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const SampleCard = () => {
  const heading = useScrollAnimation({ threshold: 0.3 });
  const card1 = useScrollAnimation({ threshold: 0.2 });
  const card2 = useScrollAnimation({ threshold: 0.2 });
  const card3 = useScrollAnimation({ threshold: 0.2 });
  const viewMore = useScrollAnimation({ threshold: 0.3 });

  const InteractiveCard = ({ imageSrc, title, delay }) => (
    <StyledWrapper style={{ animationDelay: delay }}>
      <div className="container noselect">
        <div className="canvas">
          <div className="tracker tr-1" />
          <div className="tracker tr-2" />
          <div className="tracker tr-3" />
          <div className="tracker tr-4" />
          <div className="tracker tr-5" />
          <div className="tracker tr-6" />
          <div className="tracker tr-7" />
          <div className="tracker tr-8" />
          <div className="tracker tr-9" />
          <div className="tracker tr-10" />
          <div className="tracker tr-11" />
          <div className="tracker tr-12" />
          <div className="tracker tr-13" />
          <div className="tracker tr-14" />
          <div className="tracker tr-15" />
          <div className="tracker tr-16" />
          <div className="tracker tr-17" />
          <div className="tracker tr-18" />
          <div className="tracker tr-19" />
          <div className="tracker tr-20" />
          <div className="tracker tr-21" />
          <div className="tracker tr-22" />
          <div className="tracker tr-23" />
          <div className="tracker tr-24" />
          <div className="tracker tr-25" />
          <div id="card">
            <img src={imageSrc} alt={title} className="card-image" />
            <div className="card-overlay">
              <div className="title">{title}</div>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white">
      <h1 
        ref={heading.ref}
        className={`text-xl md:text-2xl lg:text-3xl font-regular mb-4 md:mb-6 text-center mt-2 ${
          heading.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
        }`}
      >
        Sample Products
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
        <div 
          ref={card1.ref}
          className={`${card1.isVisible ? 'scroll-slide-up' : 'scroll-hidden'}`}
        >
          <InteractiveCard imageSrc={sampleP1} title="Sleek" delay="0ms" />
        </div>
        <div 
          ref={card2.ref}
          className={`${card2.isVisible ? 'scroll-slide-up' : 'scroll-hidden'}`}
        >
          <InteractiveCard imageSrc={sampleP3} title="Formal" delay="150ms" />
        </div>
        <div 
          ref={card3.ref}
          className={`${card3.isVisible ? 'scroll-slide-up' : 'scroll-hidden'}`}
        >
          <InteractiveCard imageSrc={sampleP2} title="Stylish" delay="300ms" />
        </div>
      </div>
      <div 
        ref={viewMore.ref}
        className={`flex justify-center mt-4 md:mt-6 lg:mt-8 ${
          viewMore.isVisible ? 'scroll-fade-in' : 'scroll-hidden'
        }`}
      >
        <Link to='/products' className="text-lg md:text-xl lg:text-2xl font-regular text-center cursor-pointer underline hover:text-[#35408E] hover:scale-105 transition-all duration-300">
          View More
        </Link>
      </div>
    </div>
  );
}

const StyledWrapper = styled.div`
  .container {
    position: relative;
    width: 100%;
    max-width: 524px;
    aspect-ratio: 524 / 579;
    transition: 200ms;
    margin: 0 auto;
  }

  .container:active {
    transform: scale(0.98);
  }

  #card {
    position: absolute;
    inset: 0;
    z-index: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0;
    transition: 700ms;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: 300ms;
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 1.5rem;
    transition: 300ms;
  }

  .title {
    opacity: 0;
    transition-duration: 300ms;
    transition-timing-function: ease-in-out;
    transition-delay: 100ms;
    font-size: 2rem;
    font-weight: 300;
    color: white;
    text-align: center;
    transform: translateY(20px);
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  .tracker:hover ~ #card .title {
    opacity: 1;
    transform: translateY(0);
  }

  .tracker:hover ~ #card .card-overlay {
    background: rgba(0, 0, 0, 0.3);
  }

  .tracker {
    position: absolute;
    z-index: 200;
    width: 100%;
    height: 100%;
  }

  .tracker:hover {
    cursor: pointer;
  }

  .tracker:hover ~ #card {
    transition: 300ms;
    filter: brightness(1.05);
  }

  .tracker:hover ~ #card .card-image {
    transform: scale(1.05);
  }

  .canvas {
    perspective: 800px;
    inset: 0;
    z-index: 200;
    position: absolute;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
    gap: 0px 0px;
    grid-template-areas: "tr-1 tr-2 tr-3 tr-4 tr-5"
      "tr-6 tr-7 tr-8 tr-9 tr-10"
      "tr-11 tr-12 tr-13 tr-14 tr-15"
      "tr-16 tr-17 tr-18 tr-19 tr-20"
      "tr-21 tr-22 tr-23 tr-24 tr-25";
  }

  .tr-1 {
    grid-area: tr-1;
  }

  .tr-2 {
    grid-area: tr-2;
  }

  .tr-3 {
    grid-area: tr-3;
  }

  .tr-4 {
    grid-area: tr-4;
  }

  .tr-5 {
    grid-area: tr-5;
  }

  .tr-6 {
    grid-area: tr-6;
  }

  .tr-7 {
    grid-area: tr-7;
  }

  .tr-8 {
    grid-area: tr-8;
  }

  .tr-9 {
    grid-area: tr-9;
  }

  .tr-10 {
    grid-area: tr-10;
  }

  .tr-11 {
    grid-area: tr-11;
  }

  .tr-12 {
    grid-area: tr-12;
  }

  .tr-13 {
    grid-area: tr-13;
  }

  .tr-14 {
    grid-area: tr-14;
  }

  .tr-15 {
    grid-area: tr-15;
  }

  .tr-16 {
    grid-area: tr-16;
  }

  .tr-17 {
    grid-area: tr-17;
  }

  .tr-18 {
    grid-area: tr-18;
  }

  .tr-19 {
    grid-area: tr-19;
  }

  .tr-20 {
    grid-area: tr-20;
  }

  .tr-21 {
    grid-area: tr-21;
  }

  .tr-22 {
    grid-area: tr-22;
  }

  .tr-23 {
    grid-area: tr-23;
  }

  .tr-24 {
    grid-area: tr-24;
  }

  .tr-25 {
    grid-area: tr-25;
  }

  .tr-1:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(20deg) rotateY(-10deg) rotateZ(0deg);
  }

  .tr-2:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(20deg) rotateY(-5deg) rotateZ(0deg);
  }

  .tr-3:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(20deg) rotateY(0deg) rotateZ(0deg);
  }

  .tr-4:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(20deg) rotateY(5deg) rotateZ(0deg);
  }

  .tr-5:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(20deg) rotateY(10deg) rotateZ(0deg);
  }

  .tr-6:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(10deg) rotateY(-10deg) rotateZ(0deg);
  }

  .tr-7:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(10deg) rotateY(-5deg) rotateZ(0deg);
  }

  .tr-8:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(10deg) rotateY(0deg) rotateZ(0deg);
  }

  .tr-9:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(10deg) rotateY(5deg) rotateZ(0deg);
  }

  .tr-10:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(10deg) rotateY(10deg) rotateZ(0deg);
  }

  .tr-11:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(0deg) rotateY(-10deg) rotateZ(0deg);
  }

  .tr-12:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(0deg) rotateY(-5deg) rotateZ(0deg);
  }

  .tr-13:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }

  .tr-14:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(0deg) rotateY(5deg) rotateZ(0deg);
  }

  .tr-15:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(0deg) rotateY(10deg) rotateZ(0deg);
  }

  .tr-16:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(-10deg) rotateY(-10deg) rotateZ(0deg);
  }

  .tr-17:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(-10deg) rotateY(-5deg) rotateZ(0deg);
  }

  .tr-18:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(-10deg) rotateY(0deg) rotateZ(0deg);
  }

  .tr-19:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(-10deg) rotateY(5deg) rotateZ(0deg);
  }

  .tr-20:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(-10deg) rotateY(10deg) rotateZ(0deg);
  }

  .tr-21:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(-20deg) rotateY(-10deg) rotateZ(0deg);
  }

  .tr-22:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(-20deg) rotateY(-5deg) rotateZ(0deg);
  }

  .tr-23:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(-20deg) rotateY(0deg) rotateZ(0deg);
  }

  .tr-24:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(-20deg) rotateY(5deg) rotateZ(0deg);
  }

  .tr-25:hover ~ #card {
    transition: 125ms ease-in-out;
    transform: rotateX(-20deg) rotateY(10deg) rotateZ(0deg);
  }

  .noselect {
    -webkit-touch-callout: none;
     /* iOS Safari */
    -webkit-user-select: none;
     /* Safari */
     /* Konqueror HTML */
    -moz-user-select: none;
     /* Old versions of Firefox */
    -ms-user-select: none;
     /* Internet Explorer/Edge */
    user-select: none;
     /* Non-prefixed version, currently
  									supported by Chrome, Edge, Opera and Firefox */
  }`;

export default SampleCard;