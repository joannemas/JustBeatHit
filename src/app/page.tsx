import "@/stylesheets/home.scss";
import Link from "next/link";
import Image from "next/image";
import Carousel from "@/components/Carrousel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Page() {
  const carouselImages = [
    "/assets/img/Boat.jpg",
    "/assets/img/Carrousel1.png",
  ];

  return (
    <div className="home">
      <Navbar />

      <div className="content">
        {/* Section 1 Component */}
        <section id="actualite">
          <div>
            <h2>Actualités</h2>
            <div>
              <p className="newsletter">Envie d’être au courant de toutes les actualités ? <br /></p>
              <button className="newsletterBut">
                <p>&#129122;</p> S'inscrire à la Newsletter
              </button>
            </div>
          </div>
          <div className="containerCard">
            <div className="actuCard1">
              <div>
                <p>offre de lancement</p>
                <p>50% de réduction</p>
                <p>sur l’abonnement Premium</p>
              </div>
              <Image src="/assets/img/actualite1.svg" alt="Offre de lancement" width={300} height={200} />
              <button>
                <p>&#129122;</p>En Savoir plus
              </button>
            </div>
            <div className="actuCard2">
              <div>
                <Image src="/assets/img/actualite2.svg" alt="Nouveau jeu Karakaku" width={300} height={200} />
                <span>
                  <p>nouveau jeu</p>
                  <p>karakaku</p>
                  <p>Karakaku est un jeu qui met à l'épreuve ta vitesse de frappe ! Tu dois retaper les paroles de chansons aussi vite qu'elles sont chantées !</p>
                </span>
              </div>
              <button>
                <p>&#129122;</p> Jouer
              </button>
            </div>
            <div className="actuCard3">
              <div>
                <Image src="/assets/img/team.svg" alt="Équipe JBH" width={300} height={200} />
                <p>Découvre l’équipe JBH</p>
                <button>
                  <p>&#129122;</p> En savoir plus
                </button>
              </div>
              <div>
                <p>découvrez la roadmap</p>
                <button>
                  <p>&#129122;</p> En savoir plus
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 Component */}
        <section id="jeux">
          <h2>Jeux</h2>
          <div>
            <Image src="/assets/img/Vinyl.svg" alt="Vinyl" className="vinyl" width={300} height={300} />
            <div>
              <div className="karakakuDesc">
                <h3>karakaku</h3>
                <p>Tu dois retaper les paroles de chansons aussi vite qu'elles sont chantées !</p>
              </div>
              <Image src="/assets/img/Video.svg" alt="Vidéo Karakaku" className="video" width={300} height={200} />
              <div className="smallVinyl">
                <Image src="/assets/img/Vinyl1.svg" alt="Vinyl 1" width={100} height={100} />
                <Image src="/assets/img/Vinyl2.svg" alt="Vinyl 2" width={100} height={100} />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq">
          <h2>F.A.Q</h2>
          <div>
            <div>
              <p className="question">Comment puis-je m'inscrire ?</p>
              <button className="faqBut">+</button>
            </div>
            <p className="reponse" style={{ display: 'none' }}>Vous pouvez vous inscrire en cliquant sur le bouton "S'inscrire" en haut de la page.</p>
            <hr />

            <div>
              <p className="question">Quels sont les modes de jeu disponibles ?</p>
              <button className="faqBut">+</button>
            </div>
            <p className="reponse" style={{ display: 'none' }}>Nous proposons plusieurs modes de jeu incluant des défis journaliers et des jeux de rapidité.</p>
            <hr />

            <div>
              <p className="question">Puis-je ajouter ma propre musique ?</p>
              <button className="faqBut">+</button>
            </div>
            <p className="reponse" style={{ display: 'none' }}>Oui, cette fonctionnalité est disponible avec l'abonnement Premium.</p>
            <hr />
          </div>
        </section>

        {/* Section 3 Component */}
        <section id="tarifs">
          <h2>Tarifs</h2>
          <span>
            <div className="tarifCard">
              <p className="tarifTier">gratuit</p>
              <p className="tarifDesc">Jouez aussi longtemps que vous le souhaitez.</p>
              <div className="price">
                <p>0€</p>
                <p>/mois</p>
              </div>
              <div className="advantages">
                <p>Inclus</p>
                <ul>
                  <li>Musiques libre de droits</li>
                  <li>3 jeux</li>
                  <li>1 défi journalier</li>
                  <li>Offre gratuite</li>
                </ul>
              </div>
              <button>
                <p>&#129122;</p> S'inscrire
              </button>
            </div>
            <div className="tarifCard">
              <p className="tarifTier">premium</p>
              <p className="tarifDesc">Jouez aussi longtemps que vous le souhaitez.</p>
              <div className="price">
                <p>10€</p>
                <p>/mois</p>
              </div>
              <div className="advantages">
                <p>Inclus</p>
                <ul>
                  <li>Toutes les musiques</li>
                  <li>Tous les modes et défis</li>
                  <li>Tous les défis journaliers</li>
                  <li>Ajout de fichiers audio personnalisés</li>
                </ul>
              </div>
              <button>
                <p>&#129122;</p>
                <p>S'abonner</p>
              </button>
            </div>
          </span>
        </section>
      </div>

      <Footer />
    </div>
  );
}
