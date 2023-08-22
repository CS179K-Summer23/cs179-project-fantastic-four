import { Stripe, loadStripe } from "@stripe/stripe-js"

export async function checkout ({ lineItems }) {
    let stripePromise: Promise<Stripe | null> | null = null

    const getStripe = () => {
        if(!stripePromise) {
            stripePromise = loadStripe("pk_test_51NdKdDEqkNVKC3nWrg8Q1BGV1x93xImoYlfUvw4edpz2vB4Wi0PxAkmx7f8FspLV04TmDc1DdD9cN6hw6hzuugkv00AJv9H3xI")
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