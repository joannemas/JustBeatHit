"use client"

import { useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import HCaptcha from "@hcaptcha/react-hcaptcha"
import { supabase } from '@/lib/supabase/client'
import styles from '../auth.module.scss'
import { loginAnonymously } from '@/components/auth/actions'

export default function VerifyCaptcha() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const captcha = useRef<HCaptcha | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "/"

  // Soumettre le token au serveur pour validation
  const handleSubmit = async () => {
    if (!captchaToken) {
      setError("Veuillez compléter le CAPTCHA")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await loginAnonymously({}, captchaToken)
      
      if (response?.message) {
        throw new Error(response.message)
      }

      captcha.current?.resetCaptcha()

      // Redirect to the original page
      router.replace(returnTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      setLoading(false)
    }
  }

  return (
    <div className={styles.formContainer}>
      <div className=''>
        <div className={styles.formHeader}>
          <h3>Vérification de sécurité</h3>
          <p className={styles.description}>Veuillez compléter le CAPTCHA ci-dessous pour continuer</p>
        </div>
        <div className={styles.formHeader}>
          <div className=''>
            <HCaptcha
              ref={captcha}
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
              onVerify={(token) => setCaptchaToken(token)}
            />
          </div>
          {error && <div className={styles.description}>{error}</div>}
        </div>
        <div>
          <button onClick={handleSubmit} disabled={!captchaToken || loading} className={styles.button}>
            {loading ? "Vérification..." : "Continuer"}
          </button>
        </div>
      </div>
    </div>
  )
}

