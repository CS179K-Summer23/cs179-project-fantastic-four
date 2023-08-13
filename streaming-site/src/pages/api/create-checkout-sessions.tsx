require('dotenv').config()

const express = require('express')
const app = express

app.use(express.json())

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const donationAmt = new Map([
    [1, { priceInDollars: 100, name: "Donate $100" }]
])

app.listen(3000)