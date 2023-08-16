import { NextApiRequest, NextApiResponse } from 'next';
import { Stripe } from 'stripe'; 
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe("sk_test_51NdKdDEqkNVKC3nWc9Jn8LZyHZxP3ijTygN157AoJIp0l3PdjtbSgQUVYjcsHmvecE6uWybhHrjAapNjxF23CONs00fJGY0ibJ", {
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
