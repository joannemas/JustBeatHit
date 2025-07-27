import { findUserIdFromStripeCustomerId, updateUserPlan } from '@/lib/supabase/user'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
    const body = await request.json() as Stripe.Event

    console.debug("Webhooks")

    switch(body.type){
        case "checkout.session.completed": {
            const session = body.data.object as Stripe.Checkout.Session
            const stripeCustomerId = session.customer
            const userId = await findUserIdFromStripeCustomerId(stripeCustomerId)
            if(!userId) break
            await updateUserPlan(userId)
            break
        }
        case "invoice.paid": {
            const invoice = body.data.object as Stripe.Invoice
            const stripeCustomerId = invoice.customer
            const userId = await findUserIdFromStripeCustomerId(stripeCustomerId)
            if(!userId) break
            await updateUserPlan(userId)
            break
        }
        case "invoice.payment_failed": {
            const invoice = body.data.object as Stripe.Invoice
            const stripeCustomerId = invoice.customer
            const userId = await findUserIdFromStripeCustomerId(stripeCustomerId)
            if(!userId) break
            await updateUserPlan(userId, "Freemium")
            break
        }
        case "customer.subscription.deleted": {
            const subscription = body.data.object as Stripe.Subscription
            const stripeCustomerId = subscription.customer
            const userId = await findUserIdFromStripeCustomerId(stripeCustomerId)
            if(!userId) break
            await updateUserPlan(userId, "Freemium")
            break
        }
        default: {
            console.debug("Unhandled event type", body.type)
        }
    }

    return NextResponse.json({success: true})
}