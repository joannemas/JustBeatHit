import styles from "@/stylesheets/home.module.scss";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import UpgradeButton from "@/components/UpgradeButton";
import { generateDailyMissions } from "@/components/Daily/MissionGenerator";

export default async function Page() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("user", user);
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user?.id!)
    .single();
  console.log("data", data);
  console.log("error", error);

  const today = new Date().toISOString().slice(0, 10);
  const missions = await generateDailyMissions();
  const { data: dailyMissionRow } = await supabase
    .from("daily_missions")
    .select("completed")
    .eq("user_id", user?.id!)
    .eq("date", today)
    .single();

  const completedMissions: any[] = Array.isArray(dailyMissionRow?.completed)
    ? dailyMissionRow.completed
    : [];

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
        {data ? (
          <h1>Content de te revoir {data.username} !</h1>
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
                <span className={`${styles.badge} ${styles.badgeNew}`}>
                  Nouveau
                </span>
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
                <div
                  className={`${styles.animatedSphere} ${styles["animatedSphere--yellow"]}`}
                ></div>
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
                <div
                  className={`${styles.animatedSphere} ${styles["animatedSphere--purple"]}`}
                ></div>
              </Link>

              <Link href="/game/blind-test" className={styles.gameCard}>
                <div>
                  <span className={`${styles.badge} ${styles.badgeSoon}`}>
                    Bientôt disponible
                  </span>
                  <h2>Blind test</h2>
                  <p>Le jeu qui met à l&apos;épreuve ta culture musicale !</p>
                </div>
                <div
                  className={`${styles.animatedSphere} ${styles["animatedSphere--orange"]}`}
                ></div>
              </Link>
            </div>
          </div>

          <div className={styles.challengeWrapper}>
            <div className={styles.challengeList}>
              <h3>Défis journaliers</h3>
              <ul>
                {missions.map((mission: any) => (
                  <li key={mission.id}>
                    {completedMissions.includes(mission.id) ? (
                      <span style={{ color: "green", marginRight: 8 }}>✔️</span>
                    ) : (
                      <span style={{ color: "red", marginRight: 8 }}>❌</span>
                    )}
                    {mission.text}
                  </li>
                ))}
              </ul>
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
