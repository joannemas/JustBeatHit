import "@/stylesheets/home.scss";
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
    <div className="home">
      <Navbar />
      <div className="header-homepage">
        <div className="header-homepage-text">
          <ul>
            <li>
              <h3>
                <span>Beat the hit</span>
                <span>and beat your friends</span>
              </h3>
            </li>
            <li className="feedback">
            <p>Aidez-nous à améliorer notre jeu !</p>
            <Link href="https://docs.google.com/forms/d/e/1FAIpQLSfHnAhsBZLp80V5M1mJ4AiTJRpjXfVINfIm87CUIDC758PtSQ/viewform?pli=1">
              <button className="btn-feedback">Donner son avis</button>
            </Link>
            </li>
          </ul>
          <ul>
            <li>accès rapide ·</li>
            <li>
              <Link href="/karakaku">

                <button className="start-button">
                  <Image
                    priority
                    src="/assets/img/icon/Karaoke.svg"
                    alt="Karaoke svg"
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
                alt="Soon Logo"
                className="ComingSoon"
                width={89}
                height={44}
              />
              <Link href="">
                <button className="start-button">
                  <Image
                    priority
                    src="/assets/img/icon/question-mark.svg"
                    alt="Question svg"
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
                alt="Soon Logo"
                className="ComingSoon"
                width={89}
                height={44}
              />
              <Link href="/">
                <button className="start-button">
                  <Image
                    priority
                    src="/assets/img/icon/music-1.svg"
                    alt="Music svg"
                    width={24}
                    height={24}
                  />
                  N&apos;oubliez pas les paroles</button>
              </Link>
            </li>
            <div className="">
              <Carousel images={carouselImages} />
            </div>
          </ul>
        </div>
        <Image
          priority
          src="/assets/img/Logo.svg"
          alt="Logo"
          className="Logo"
          width={584}
          height={756}
        />
      </div>
      <div>
        <Image
          src="/assets/img/Boat.jpg"
          alt="Boat"
          className="BoatImage"
          width={1792}
          height={419}
        />
      </div>
      <div className="desc-jbh-homepage">
        <h3>Just Beat Hit propose une variété de <br /> mini-jeux rythmés pour tester vos <br />réflexes et votre sens du tempo</h3>
      </div>
    </div>
  );
};