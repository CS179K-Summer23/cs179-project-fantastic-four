import { NextApiRequest, NextApiResponse } from 'next';
import { Stripe } from 'stripe'; 

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
    apiVersion: '2022-11-15', 
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,  // Amount in cents
      currency: 'usd',
    });
    
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while creating the payment intent.' });
  }
}
