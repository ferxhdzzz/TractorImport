import React, { useState } from "react";
import "./ImageSlider.css";

const ImageSlider = ({ images, name }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="slider-container">
      <img
        src={images[currentIndex]}
        alt={`${name} ${currentIndex + 1}`}
        className="slider-image"
      />
      <div className="slider-controls">
        <button onClick={prevImage} className="slider-button">←</button>
        <span>{currentIndex + 1} / {images.length}</span>
        <button onClick={nextImage} className="slider-button">→</button>
      </div>
    </div>
  );
};

export default ImageSlider;
