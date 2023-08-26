import React, { useState, useRef } from "react";
import Link from "next/link"; // Import Link
import Modal from "react-modal";
import ReCAPTCHA from "react-google-recaptcha";

interface DonationFormProps {
  onClose: () => void;
}

const DonationForm: React.FC<DonationFormProps> = ({ onClose }) => {
  const [donationAmount, setDonationAmount] = useState(0);
  const [cartAmount, setCartAmount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleAmountChange = (event: { target: { value: string } }) => {
    setDonationAmount(parseFloat(event.target.value));
  };

  const handleCheckout = () => {
    setCartAmount(cartAmount + donationAmount);
    console.log(`Added $${donationAmount.toFixed(2)} to cart.`);
  };

  const handleRecaptcha = (value: string | null) => {
    if (value) {
      setIsVerified(true);
    }
  };

  const handleCheckoutClick = () => {
    fetch("http://localhost:3000/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          { id: 1, quantity: 3 },
          { id: 2, quantity: 1 },
        ],
      }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        return res.json().then((json) => Promise.reject(json));
      })
      .then(({ url }) => {
        console.log(url);
      })
      .catch((e) => {
        console.error(e.error);
      });
  };

  return (
    <div>
      <h2>Donation Form</h2>
      <div>
        <input
          type="number"
          value={donationAmount}
          onChange={handleAmountChange}
          style={{
            position: "relative",
            left: "-4px",
            border: "2px solid #ccc",
            padding: "4px",
            borderRadius: "12px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleCheckout}
          className="text-center ml-1 bg-gray-900 text-white font-bold rounded-lg px-2 py-1 hover:bg-gray-600"
        >
          Add to Cart
        </button>
        <button
          onClick={onClose}
          className="text-center ml-1 bg-gray-900 text-white font-bold rounded-lg px-2 py-1 hover:bg-gray-600"
        >
          Cancel
        </button>

        <Link
          href={isVerified ? "/checkout" : "#"}
          onClick={isVerified ? handleCheckoutClick : undefined}
          className={`text-center ml-1 font-bold rounded-lg px-2 py-1 ${
            isVerified
              ? "bg-gray-900 text-white hover:bg-gray-600"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
        >
          Checkout
        </Link>

        {cartAmount >= 0 && <p>Current Cart Total: ${cartAmount.toFixed(2)}</p>}
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey="6LenHNgnAAAAAKEt-eig8PmEA195T_0BzV9p_KiJ"
          onChange={handleRecaptcha}
        />
      </div>
    </div>
  );
};

export default DonationForm;
