import '@/stylesheets/auth.scss';
import Image from 'next/image';

export const metadata = {
  title: 'Authentification - Just Beat Hit',
  description: 'Connexion et inscription',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <>
      <div>
        <Image src="/assets/img/Logo.svg" alt="Just Beat Hit" width={250} height={250} />
      </div>
      <div className="auth-container">
          {children}
      </div>

      <div >
        <Image src="/assets/img/Vinyl-jaune.png" alt="Just Beat Hit" width={400} height={0} className='vinyl-container' />
      </div>
    </>
  )
}