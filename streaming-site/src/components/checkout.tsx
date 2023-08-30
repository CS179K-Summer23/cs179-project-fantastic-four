import { Stripe, loadStripe } from "@stripe/stripe-js"

interface CheckoutParams {
    mode: 'subscription' | 'payment'; // Allow only specific values
    lineItems: {
        price: string;
        quantity: number;
    }[];
}

export async function checkout({ mode, lineItems }: CheckoutParams) {
    let stripePromise: Promise<Stripe | null> | null = null;

    const getStripe = () => {
        if (!stripePromise) {
            stripePromise = loadStripe("pk_test_51NdKdDEqkNVKC3nWrg8Q1BGV1x93xImoYlfUvw4edpz2vB4Wi0PxAkmx7f8FspLV04TmDc1DdD9cN6hw6hzuugkv00AJv9H3xI");
        }
        return stripePromise;
    }

    const stripe: any = await getStripe();

    await stripe.redirectToCheckout({
        mode: mode,
        lineItems: lineItems,
        successUrl: window.location.origin,
        cancelUrl: window.location.origin,
    });
}
