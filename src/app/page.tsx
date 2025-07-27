import styles from "@/stylesheets/home.module.scss";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { generateDailyMissions } from "@/components/Daily/MissionGenerator";

export default async function Page() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className={styles.home}>
        <Navbar />
        <h1>Vous devez être connecté pour voir cette page.</h1>
        <Link href="/auth/login">Se connecter</Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const today = new Date().toISOString().slice(0, 10);

  let { data: missions, error: selectError } = await supabase
    .from("daily_missions")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today);

  if (!missions || missions.length === 0) {
    await generateDailyMissions(supabase, user.id, today);

    const { data: newMissions, error: newFetchError } = await supabase
      .from("daily_missions")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today);

    missions = newMissions || [];
  }

  function getTimeUntilMidnight() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

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
        {profile ? (
          <h1>Content de te revoir {profile.username} !</h1>
        ) : (
          <h1>
            Bienvenue sur Just Beat Hit,{" "}
            <a href={`/auth/register`} className={styles.registerLink}>
              inscris toi
            </a>{" "}
            pour jouer !
          </h1>
        )}

        <div className={styles.homeContentContainer}>
          <div className={styles.gameList}>
            <Link href="/game/karakaku" className={styles.gameCard}>
              <div>
                <span className={`${styles.badge} ${styles.badgeNew}`}>Nouveau</span>
                <h2>Karakaku</h2>
                <p>Le jeu qui met à l&apos;épreuve ta vitesse de frappe !</p>
              </div>
              <div className={styles.imgPreview}>
                <Image
                  src="/assets/img/karakaku-preview.png"
                  alt="Karakaku game preview"
                  fill
                  style={{
                    objectPosition: "left center",
                    objectFit: "cover",
                    zIndex: 1,
                  }}
                  className={styles.gamePreview}
                />
                <div className={`${styles.animatedSphere} ${styles["animatedSphere--yellow"]}`}></div>
              </div>
            </Link>

            <div className={styles.rowCards}>
              <Link href="/game/paroles-en-tete" className={styles.gameCard}>
                <div>
                  <span className={`${styles.badge} ${styles.badgeSoon}`}>
                    Bientôt disponible
                  </span>
                  <h2>Paroles en tête</h2>
                  <p>Le jeu qui met à l&apos;épreuve ta mémoire !</p>
                </div>
                <div className={`${styles.animatedSphere} ${styles["animatedSphere--purple"]}`}></div>
              </Link>
              <Link href="/game/blind-test" className={styles.gameCard}>
                <div>
                  <span className={`${styles.badge} ${styles.badgeSoon}`}>
                    Bientôt disponible
                  </span>
                  <h2>Blind test</h2>
                  <p>Le jeu qui met à l&apos;épreuve ta culture musicale !</p>
                </div>
                <div className={`${styles.animatedSphere} ${styles["animatedSphere--orange"]}`}></div>
              </Link>
            </div>
          </div>

          <div className={styles.challengeWrapper} style={{ position: "relative" }}>
            <div className={styles.challengeList}>
              <h3>Défis journaliers</h3>
              <ul>
                {missions.map((mission) => (
                  <li key={mission.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={!!mission.completed}
                      readOnly
                      style={{
                        accentColor: mission.completed ? "green" : "red",
                      }}
                    />
                    {mission.text}
                  </li>
                ))}
              </ul>
              <div
                style={{
                  position: "absolute",
                  right: 16,
                  bottom: 8,
                  fontSize: "1.2em",
                  color: "red",
                  background: "rgba(255,255,255,0.7)",
                  padding: "4px 12px",
                  borderRadius: "12px",
                }}
              >
                {getTimeUntilMidnight()}
              </div>
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
}