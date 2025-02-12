"use client"
import { useState } from "react";
import styles from "@/stylesheets/carrousel.module.scss";

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
    <div className={styles.carouselContainer}>
      <div className={styles.carouselHeader}>
        <div className={styles.carouselArrows}>
          <button onClick={prevSlide} className={styles.arrow}>&#10094;</button>
          <button onClick={nextSlide} className={styles.arrow}>&#10095;</button>
        </div>
        <div className={styles.carouselTitle}>
          <h2>Dernières actualités ·</h2>
        </div>
      </div>
      <div className={styles.carouselContent}>
        <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} className={styles.slide} />
      </div>
    </div>
  );
};

export default Carousel;