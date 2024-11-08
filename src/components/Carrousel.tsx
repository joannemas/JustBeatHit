"use client"
import { useState } from "react";
import "@/stylesheets/Carrousel.scss";

const Carousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="carousel-container">
      <div className="carousel-header">
        <div className="carousel-arrows">
          <button onClick={prevSlide} className="arrow">&#10094;</button>
          <button onClick={nextSlide} className="arrow">&#10095;</button>
        </div>
        <div className="carousel-title">
          <h2>Dernières actualités ·</h2>
        </div>
      </div>
      <div className="carousel-content">
        <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} className="slide" />
      </div>
    </div>
  );
};

export default Carousel;