import Link from 'next/link';
import styles from '@/stylesheets/gameend.module.scss';
import ShareButton from './ShareButton';
import { createClient } from '@/lib/supabase/server';
import ReplayButton from './ReplayButton';
import Image from 'next/image';

export default async function GameResult({ gameId }: { gameId: string }) {
    const supabase = createClient()
    const user = (await supabase.auth.getUser()).data.user ?? undefined

    const gameData = (await supabase
        .from('games')
        .select('*, song:song(title, singer)')
        .eq('id', gameId)
        .single()).data ?? undefined;


    return (
        <div className={styles.gameResult}>
            <div className={styles.animatedBackground}></div>

            <div className={styles.gameInfos}>
                <Image priority
                    src="/assets/img/logo-jbh.png"
                    alt="Logo Just Beat Hit"
                    width={100}
                    height={100}
                    className={styles.logoJbh}
                />

                <div className={styles.titleSong}>
                    <Image
                        src="/assets/img/icon/down-round-arrow.svg"
                        alt="Arrow svg"
                        width={30}
                        height={30}
                        className={styles.musicIcon}
                    />
                    <h5>{gameData?.song?.singer} - {gameData?.song?.title}</h5>
                </div>

                <Image priority
                    src="/assets/img/vinyl-jbh.svg"
                    alt="Vinyl svg"
                    width={1000}
                    height={1000}
                    className={`${styles.vinylPlayer} ${styles['--playing']}`}
                />
            </div>

            <div className={styles.finalScore}>
                <h2>Classement</h2>
                <div className={styles.scoreDisplay}>
                    {/* <p>Nombre de lignes en pause : {pauseCount} pauses / {totalLines} lignes</p> */}
                    <p>Vitesse de frappe : {gameData?.word_speed} mots par minute</p>
                    <p>Précision d&apos;écriture : {gameData?.typing_accuracy}%</p>
                    {/* <p>Nombre de fautes : {data.mistakes} / {totalChars}</p> */}
                </div>

                <div className={styles.score}>
                <div className={styles.score_display}>
                <div className={styles.scoreLine}>
                <Image src="/assets/img/icon/score-line.svg" alt="Score" width={24} height={24} />
                    <p className={styles.actualScore}>{gameData?.score}</p>
                </div>
                    <p className={styles.label}>Score</p>
                    </div>
                </div>


                <h3>Bien joué !</h3>
                <div className={styles.btnList}>
                    {/* If the user is not the game owner, render challenge button */}
                    {user?.id !== gameData?.user_id && <ReplayButton gameId={gameId}>Défié</ReplayButton>}

                    {/* If the user is the game owner, render differents buttons */}
                    {user?.id === gameData?.user_id && <ReplayButton gameId={gameId}>Recommencer</ReplayButton>}
                    {user?.id === gameData?.user_id && <Link href="/game/karakaku">
                        <button className={styles.btnEchap}>Choix des musiques</button>
                    </Link>}
                    {user?.id === gameData?.user_id && <ShareButton score={gameData?.score} />}
                </div>

                <div className={`${styles.animatedBackground} ${styles['--inverse']}`}></div>

            </div>
        </div>
        
    );
}
