import Link from 'next/link';
import styles from '@/stylesheets/navbar.module.scss';
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('profiles').select('*').eq('id', user?.id!).single()

    return (
        <div className={styles.navbar}>
            <ul><li><Link href="/">
                <Image
                    priority
                    src="/assets/img/LogoMini.svg"
                    alt="Logo Mini"
                    className={styles.LogoMini}
                    width={57}
                    height={57}
                />

            </Link></li></ul>
            <ul>
                <li>Jeux</li>
                <li>l&apos;équipe JBH</li>
                <li>Contact</li>
                <li>à propos</li>
            </ul>
            {data ?
                <ul>
                    <li>Comment ça va <span>{data.username}</span> ?</li>
                    <a href={`/profile/${data.username}`}>
                        <Image
                            priority
                            src={data.avatar_url}
                            alt="Profil"
                            width={44}
                            height={44}
                        />
                    </a>
                </ul>
                :
                <ul>
                    <li>Bienvenue, <a href={`/auth/register`} className={styles.registerLink}>inscris toi</a> pour jouer ! </li>
                </ul>
            }
        </div>
    );
}
