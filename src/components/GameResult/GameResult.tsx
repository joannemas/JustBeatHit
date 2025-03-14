import Link from 'next/link';
import styles from '@/stylesheets/gameend.module.scss';
import ShareButton from './ShareButton';
import { createClient } from '@/lib/supabase/server';
import ReplayButton from './ReplayButton';

export default async function GameResult({ gameId }: { gameId: string }) {
    const supabase = createClient()
    const user = (await supabase.auth.getUser()).data.user ?? undefined

    const gameData = (await supabase.from('games').select().eq('id', gameId).single()).data ?? undefined

    return (
        <div className={styles.finalScore}>
            <div className={styles.scoreDisplay}>
                <p>Score final: {gameData?.score}</p>
                {/* <p>Nombre de lignes en pause : {pauseCount} pauses / {totalLines} lignes</p> */}
                <p>Vitesse de frappe : {gameData?.word_speed} mots par minute</p>
                <p>Précision d&apos;écriture : {gameData?.typing_accuracy}%</p>
                {/* <p>Nombre de fautes : {data.mistakes} / {totalChars}</p> */}
            </div>
            <div className={styles.btnList}>
                {/* If the user is not the game owner, render challenge button */}
                {user?.id !== gameData?.user_id && <ReplayButton gameId={gameId}>Défié</ReplayButton>}

                {/* If the user is the game owner, render differents buttons */}
                {user?.id === gameData?.user_id && <ReplayButton gameId={gameId}>Rejouer</ReplayButton>}
                {user?.id === gameData?.user_id && <Link href="/game/karakaku">
                    <button className={styles.btnSecondary}>Retour choix de musiques</button>
                </Link>}
                {user?.id === gameData?.user_id && <ShareButton score={gameData?.score} />}
            </div>
        </div>
    );
}
