import { createSubscription } from '@/lib/stripe'
import { headers } from 'next/headers'

export default function UpgradeButton() {
  const headersList = headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto')

  return (
    <form>
        <button formAction={createSubscription.bind(null,process.env.STRIPE_PRODUCT_ID!, `${protocol}://${host}/`, `${protocol}://${host}/`)}>UpgradeButton</button>
    </form>
  )
}
