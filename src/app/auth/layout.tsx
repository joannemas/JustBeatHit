import Image from 'next/image';

import styles from './auth.module.scss';
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
      <div className={styles.authContainer}>
        <Image src="/assets/img/Logo.svg" alt="Just Beat Hit" width={200} height={200} aria-hidden="true" className={styles.logo} />
        {children}
        <div className={styles.vinyl}>
          <Image src="/assets/img/vinyl-jaune.png" alt="" width={652} height={1055} aria-hidden="true" loading="lazy" layout="responsive" />
        </div>
      </div>
    </>
  )
}