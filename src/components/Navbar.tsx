import Link from 'next/link';
import '@/stylesheets/navbar.scss';
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single()

    return (
        <div className="navbar">
            <ul><li><Link href="/">
                <Image
                    priority
                    src="/assets/img/LogoMini.svg"
                    alt="Logo Mini"
                    className="LogoMini"
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
            {user ? 
            <ul>
                <li>Comment ça va <span>{data.username}</span> ?</li>
                <a href={`/profile/${data.username}`}>
                    <Image
                        priority
                        src={data.avatar_url}
                        alt="Profil"
                        className="Profil"
                        width={44}
                        height={44}
                    />
                </a>
            </ul>
            :
            <ul>
                <li>Bienvenue, <a href={`/auth/register`} className='register-link'>inscris toi</a> pour jouer ! </li>
            </ul>
            }
        </div>
    );
}
