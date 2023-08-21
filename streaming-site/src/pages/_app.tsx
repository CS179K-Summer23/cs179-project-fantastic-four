import type { AppProps } from 'next/app'
import '../styles/globals.css'
import 'video.js/dist/video-js.css'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51NdKdDEqkNVKC3nWrg8Q1BGV1x93xImoYlfUvw4edpz2vB4Wi0PxAkmx7f8FspLV04TmDc1DdD9cN6hw6hzuugkv00AJv9H3xI');

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 inset-0 absolute h-full w-full overflow-auto">
      <Elements stripe={stripePromise}>
        <Component {...pageProps} />
      </Elements>
    </div>
  );
}

export default MyApp;
