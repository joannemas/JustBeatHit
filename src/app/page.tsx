import styles from "@/stylesheets/home.module.scss";
import Link from "next/link";
import Image from "next/image";
import Carousel from "@/components/Carrousel";
import Navbar from "@/components/Navbar";


export default function Page() {
  const carouselImages = [
    "/assets/img/Boat.jpg",
    "/assets/img/Carrousel1.png",
  ];

  return (
    <div className={styles.home}>
      <Navbar />
      <div className={styles.headerHomepage}>
        <div className={styles.headerHomepageContent}>
          <ul>
            <li>
              <h3>
                <span>Beat the hit</span>
                <span>and beat your friends</span>
              </h3>
            </li>
            <li className={styles.feedback}>
              <p>Aidez-nous à améliorer notre jeu !</p>
              <Link href="https://docs.google.com/forms/d/e/1FAIpQLSfHnAhsBZLp80V5M1mJ4AiTJRpjXfVINfIm87CUIDC758PtSQ/viewform?pli=1">
                <button className={styles.btnFeedback}>Donner son avis</button>
              </Link>
            </li>
          </ul>
          <ul>
            <li>accès rapide ·</li>
            <li>
              <Link href="/game/karakaku">
                <button className={styles.startButton}>
                  <Image
                    priority
                    src="/assets/img/icon/Karaoke.svg"
                    alt="" // Pas de texte alternatif pour les images décoratives
                    aria-hidden="false"
                    width={24}
                    height={24}
                  />
                  karakaku</button>
              </Link>
            </li>
            <li>
              <Image
                priority
                src="/assets/img/SoonLogo.svg"
                alt=""  // Pas de texte alternatif pour les images décoratives
                aria-hidden="true"
                width={89}
                height={44}
              />
              <Link href="">
                <button className={styles.startButton}>
                  <Image
                    priority
                    src="/assets/img/icon/question-mark.svg"
                    alt="" // Pas de texte alternatif pour les images décoratives
                    aria-hidden="true"
                    width={24}
                    height={24}
                  />
                  Blind Test</button>
              </Link>
            </li>
            <li>
              <Image
                priority
                src="/assets/img/SoonLogo.svg"
                alt="" // Pas de texte alternatif pour les images décoratives
                aria-hidden="true"
                width={89}
                height={44}
              />
              <Link href="/">
                <button className={styles.startButton}>
                  <Image
                    priority
                    src="/assets/img/icon/music-1.svg"
                    alt="" // Pas de texte alternatif pour les images décoratives
                    aria-hidden="true"
                    width={24}
                    height={24}
                  />
                  N&apos;oubliez pas les paroles</button>
              </Link>
            </li>
            <div>
              <Carousel images={carouselImages} />
            </div>
          </ul>
        </div>
        <Image
          priority
          src="/assets/img/Logo.svg"
          alt="Logo"
          className={styles.logo}
          width={584}
          height={756}
        />
      </div>
      <div>
        <Image
          src="/assets/img/Boat.jpg"
          alt="Boat"
          className={styles.boatImage}
          width={1792}
          height={419}
        />
      </div>
      <div className={styles.description}>
        <h3>Just Beat Hit propose une variété de <br /> mini-jeux rythmés pour tester vos <br />réflexes et votre sens du tempo</h3>
      </div>
    </div>
  );
};