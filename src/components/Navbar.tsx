import Link from 'next/link';
import Image from "next/image";
import '@/stylesheets/navbar.scss';
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('profiles').select('*').eq('id', user?.id!).single();

    return (
        <div className="landingHead">
            <div className="topbar">
                <Link href="/">
                    <Image 
                        priority
                        src="/assets/img/logo-jbh.png" 
                        alt="Logo"
                        width={100} 
                        height={50}
                    />
                </Link>
                <div>
                    {data ? (
                        <>
                            <Link href={`/profile/${data.username}`}>
                                <button>
                                    <p>&#129122;</p> {data.username}
                                </button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login">
                                <button>
                                    <p>&#129122;</p> se connecter
                                </button>
                            </Link>
                            <Link href="/auth/register">
                                <button>
                                    <p>&#129122;</p> s'inscrire
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <nav className="headerNav">
                <Link href="/">just beat it</Link>
                <Link href="#actualite">Actualités</Link>
                <Link href="#jeux">Jeux</Link>
                <Link href="#faq">F.A.Q</Link>
                <Link href="#tarifs">Tarifs</Link>
            </nav>

            <div className="headerContent">
                <div>
                    <div>
                        <h1>
                            <p>Défie tes amis</p>
                            <p>sur des minis-jeux</p>
                            <p>musicaux</p>
                        </h1>
                        <p className="description">
                            <strong>Just Beat Hit</strong> propose une variété de mini-jeux rythmés pour tester vos réflexes
                            et votre sens du tempo.
                        </p>
                    </div>
                    <Link href="/games">
                        <button className="playButton">
                            Jouer
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
