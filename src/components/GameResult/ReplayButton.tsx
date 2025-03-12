'use client'

import { ReactNode } from 'react'
import styles from '@/stylesheets/gameend.module.scss';
import { replayGame } from '@/app/game/actions';

export default function ReplayButton({children, gameId}: {children: ReactNode, gameId: string}) {
    return (
        <button className={styles.btnPrimary} onClick={()=> replayGame(gameId)}>{children}</button>
    )
}
