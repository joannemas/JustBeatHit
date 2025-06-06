import Link from 'next/link';
import styles from '@/stylesheets/gameend.module.scss';
import ShareButton from './ShareButton';
import { createClient } from '@/lib/supabase/server';
import ReplayButton from './ReplayButton';
import Image from 'next/image';

export default async function GameResult({ gameId }: { gameId: string }) {
    const supabase = createClient()
    const user = (await supabase.auth.getUser()).data.user ?? undefined
    /** @todo: Improve Error handling */

    const gameData = (await supabase
        .from('games')
        .select('*, song:song(title, singer)')
        .eq('id', gameId)
        .single()).data ?? undefined;
    
    if (!gameData) {
        return <div>Game not found</div>;
    }
    console.log('gameData', gameData)

    /** @todo: Ajoute le classement de la personne qui à fais al partie */

    // Fetch the top 3 scores with usernames
    const gameLeaderBoard = (await supabase
        .from('best_score')
        .select('score, profiles(username, avatar_url, user_id)') // Jointure pour obtenir le username et l'avatar
        .eq('song_id', gameData?.song_id!)
        .eq('game', gameData?.game_name)
        .order('score', { ascending: false }) // Trier en fonction du premier qui a eu le score
        .order('created_at', { ascending: true }) // Trier en fonction de la date de création
        .limit(3)
    ).data ?? undefined;

    console.log('gameLeaderBoard', gameLeaderBoard)

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
                <ul className={styles.leaderBord}>
                    {(gameLeaderBoard && gameLeaderBoard.length > 0) && 
                        gameLeaderBoard.map((item, index) => (
                            <li key={index} className={styles.leaderBoardItem}>
                                <div className={styles.inner}>
                                    <div className={styles.imageWrapper}>
                                        <Image
                                            src={item.profiles?.avatar_url || ''}
                                            alt="User avatar"
                                            width={64}
                                            height={64}
                                            className={styles.itemAvatar}
                                        />
                                    </div>
                                    <p className={styles.itemUsername}>{index + 1} - {item.profiles?.username}</p>
                                    <p className={styles.itemScore}>{item.score} points</p>
                                </div>
                            </li>
                        ))
                    }
                </ul>
                <div className={styles.scoreDisplay}>
                    {/* <p>Nombre de lignes en pause : {pauseCount} pauses / {totalLines} lignes</p> */}
                    {/* <p>Nombre de fautes : {data.mistakes} / {totalChars}</p> */}
                </div>

                <div className={styles.score}>
                <div className={styles.score_display}>
                    <p><span>{gameData?.word_speed} mots / minute</span><br/>Vitesse</p>
                    <p><span>{gameData?.typing_accuracy}%</span><br/>Précision</p>
                <div className={styles.scoreLine}>
                <Image src="/assets/img/icon/score-line.svg" alt="Score" width={24} height={24} />
                    <p className={styles.actualScore}>{gameData?.score}</p>
                </div>
                    <p className={styles.label}>Score</p>
                    </div>
                </div>


                <div className={styles.btnContainerList}>
                    <h3>Bien joué !</h3>
                    <div className={styles.btnList}>
                        {/* If the user is not the game owner, render challenge button */}
                        {user?.id !== gameData?.user_id && <ReplayButton gameId={gameId}>Défier</ReplayButton>}

                        {/* If the user is the game owner, render differents buttons */}
                        {user?.id === gameData?.user_id && <ReplayButton gameId={gameId}>Recommencer</ReplayButton>}
                        {user?.id === gameData?.user_id && <Link href="/game/karakaku">
                            <button className={styles.btnEchap}>Choix des musiques</button>
                        </Link>}
                    </div>
                    <div className={styles.btnList}>
                        {user?.id === gameData?.user_id && <ShareButton score={gameData?.score} />}
                    </div>
                </div>


                <div className={`${styles.animatedBackground} ${styles['--inverse']}`}></div>

            </div>
        </div>
        
    );
}
