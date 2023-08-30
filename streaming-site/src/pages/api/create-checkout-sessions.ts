import { NextApiRequest, NextApiResponse } from "next";

require('dotenv').config();

const express = require('express');
const app = express(); 
app.use(express.json());
const cors = require('cors');
app.use(cors());

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const donationAmt = new Map([
    [1, { priceInDollars: 100, name: "Donate $100" }]
]);

app.post('/create-checkout-session', async (req: NextApiRequest, res: NextApiResponse) => {
    res.json({ url: 'testing url' })
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
