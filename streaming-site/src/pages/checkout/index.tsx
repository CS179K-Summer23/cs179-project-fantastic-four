import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import { PaymentElement } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/checkout-form';


const stripePromise = loadStripe('pk_test_51NdKdDEqkNVKC3nWrg8Q1BGV1x93xImoYlfUvw4edpz2vB4Wi0PxAkmx7f8FspLV04TmDc1DdD9cN6hw6hzuugkv00AJv9H3xI');

export default function App() {
  const options = {
    // passing the client secret obtained from the server
    clientSecret: '{{CLIENT_SECRET}}',
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
};
