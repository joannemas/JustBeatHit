import Link from 'next/link';
import '@/stylesheets/navbar.scss';
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
    const supabase = createClient()

    const { data } = await supabase.auth.getUser()
    const { data: { username, avatar_url } } = await supabase.from('profiles').select('*').eq('id', data.user?.id).single()

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
            <ul>
                <li>Comment ça va <span>{username}</span> ?</li>
                <a href={`/profile/${username}`}>
                    <Image
                        priority
                        src={avatar_url}
                        alt="Profil"
                        className="Profil"
                        width={44}
                        height={44}
                    />
                </a>
            </ul>
        </div>
    );
}
