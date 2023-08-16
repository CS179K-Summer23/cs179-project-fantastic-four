// components/CheckoutForm.js
import React, { useEffect, useState } from 'react';
import { PaymentElement, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
      setClientSecret(data.clientSecret);
    });
  }, []);

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
  
    if (!stripe || !elements) {
      return;
    }
  
    const cardElement = elements.getElement('card'); 
    if (!cardElement || !(cardElement instanceof CardElement)) {
      console.error('Invalid card element');
      return;
    }
  
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });
  
    if (result.error) {
      console.error(result.error.message);
    } else {
      // Handle successful payment
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit">Submit</button>
    </form>
  );
};

export default CheckoutForm;
