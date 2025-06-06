import styles from "@/stylesheets/home.module.scss";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";


export default async function Page() {

  const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('profiles').select('*').eq('id', user?.id!).single()

  return (
    <div className={styles.home}>
      <Navbar />
      <div className={styles.musicDecoration}>
        <Image
          src="/assets/img/MusicBar-gradient.svg"
          alt="Music"
          width={100}
          height={100}
          className={styles.musicDecoration}
        />
      </div>

      <div className={styles.homeContent}>
      {/* {data ?
        <h1>Content de te voir {data.username} !</h1>
      :
        <h1>Bienvenue sur Just Beat Hit, <a href={`/auth/register`} className={styles.registerLink}>inscris toi</a> pour jouer !</h1>
      } */}
        <div className={styles.homeContentContainer}>
          <div className={styles.gameList}>
            <Link href="/game/karakaku" className={styles.gameCard}>
            <div>
                <h2>Karakaku</h2>
                <p>Le jeu qui met à l&apos;épreuve ta vitesse de frappe !</p>
            </div>
            <div>
              <Image
                src="/assets/img/karakaku-preview.png"
                alt="Karakaku game preview"
                width={100}
                height={100}
                style={{ objectFit: 'contain', objectPosition: 'right center', zIndex: 0 }}
                className={styles.gamePreview}
              />
            </div>

            </Link>

            <div className={styles.rowCards}>
            <Link href="/game/paroles-en-tete" className={styles.gameCard}>
              <div>
                <h2>Paroles en tête</h2>
                <p>Le jeu qui met à l&apos;épreuve ta mémoire !</p>
              </div>
              <div className={styles.animatedSphere}></div>
            </Link>

            <Link href="/game/blind-test" className={styles.gameCard}>
              <div>
                <h2>Blind test</h2>
                <p>Le jeu qui met à l&apos;épreuve ta culture musicale !</p>
              </div>
              <div className={styles.animatedSphere}></div>
            </Link>
            </div>
            
          </div>

          <div className={styles.challengeWrapper}>
            <div className={styles.challengeList}>
              <h3>Défis journaliers</h3>
            </div>
          </div>

        </div>
      </div>

      <div className={styles.vinylDecoration}>
        <Image
          src="/assets/img/vinyl-jbh.svg"
          alt="Vinyl"
          width={100}
          height={100}
          className={`${styles.vinylDecoration} ${styles["--playing"]}`}
        />
      </div>
    </div>
  );
};