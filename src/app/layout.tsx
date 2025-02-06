import '@/stylesheets/base.scss';
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

// Font files can be colocated inside of `app`
// const goia = localFont({
//   src: "fonts/Goia/GoiaVariable.ttf",
//   display: "swap",
//   variable: "--font-goia"
// })
//
// const goiaDisplay = localFont({
//   src: "fonts/GoiaDisplay/GoiaDisplay-Regular.otf",
//   display: "swap",
//   variable: "--font-goiaDisplay"
// })

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: "--font-inter"
})
export const metadata = {
  title: 'Just Beat Hit',
  description: 'Jeux musicaux en ligne',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        {children}
      </body>
    </html>
  )
}