import Link from 'next/link';
import '@/stylesheets/footer.scss';
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function Footer() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id as string)
        .single();

    return (
        <footer className="footer">
            <div className="leftSide">
                <div className="container">
                    <div className="footer-section">
                        <h2>JUST BEAT HIT</h2>
                        <nav className="footerNav">
                            <Link href=".landingHead">just beat it</Link>
                            <Link href="#actualite">Actualités</Link>
                            <Link href="#jeux">Jeux</Link>
                            <Link href="#faq">F.A.Q</Link>
                            <Link href="#tarifs">Tarifs</Link>
                        </nav>
                        <div className="social-icons">
                            <a href="#"><i className="fab fa-facebook-f"></i></a>
                            <a href="#"><i className="fab fa-twitter"></i></a>
                            <a href="#"><i className="fab fa-instagram"></i></a>
                            <a href="#"><i className="fab fa-linkedin-in"></i></a>
                            <a href="#"><i className="fab fa-youtube"></i></a>
                        </div>
                    </div>
                    <div className="footer-section">
                        <h2>CONTACT US</h2>
                        <p><i className="fas fa-envelope"></i> just.beat.hit@gmail.com</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>Just Beat Hit © 2025</p>
                    <p>Tout droits réservés</p>
                </div>
            </div>
            <div className="rightSide">
                <div className="footer-logo-section">
                    <Image 
                        className="footerLogo" 
                        src="/assets/img/logo-jbh.png" 
                        alt="Just Beat Hit Logo" 
                        width={150} 
                        height={150} 
                    />
                </div>
            </div>
        </footer>
    );
}