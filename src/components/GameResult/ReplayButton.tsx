'use client'

import { ReactNode } from 'react'
import styles from '@/stylesheets/gameend.module.scss';
import { replayGame } from '@/app/game/actions';
import Image from 'next/image';

export default function ReplayButton({children, gameId}: {children: ReactNode, gameId: string}) {
    return (
        <button className={styles.btnEchap} onClick={()=> replayGame(gameId)}>
            <Image
                src="/assets/img/icon/refresh.svg"
                alt="Play"
                width={24}
                height={24}
                className={styles.playIcon}
            />
            {children}
        </button>

    )
}
