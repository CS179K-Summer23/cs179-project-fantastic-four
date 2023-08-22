import { Stripe, loadStripe } from "@stripe/stripe-js"

export async function checkout ({ lineItems }) {
    let stripePromise: Promise<Stripe | null> | null = null

    const getStripe = () => {
        if(!stripePromise) {
            stripePromise = loadStripe(process.env.NEXT_PUBLIC_PUBLISHABLE_KEY)
        }
        return stripePromise
    }

    const stripe = await getStripe()

    await stripe.redirectToCheckout({
        mode: 'payment',
        lineItems,
        successUrl: `${window.location.origin}?_session_id={CHECKOUT_SESSION}`,
        cancelUrl: window.location.origin
    })
}