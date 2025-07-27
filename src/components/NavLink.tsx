'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import styles from '@/stylesheets/navbar.module.scss'

type Props = {
    href: string
    children: React.ReactNode
}

export default function NavLink({ href, children }: Props) {
    const pathname = usePathname()
    const isActive = pathname === href || pathname.startsWith(href + '/')

    return (
        <li className={clsx(styles.navItem, { [styles.active]: isActive })}>
            <Link href={href}>{children}</Link>
        </li>
    )
}
