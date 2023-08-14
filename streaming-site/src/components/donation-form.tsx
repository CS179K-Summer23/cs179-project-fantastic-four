import React, { useState } from 'react';
import Link from 'next/link'; // Import Link
import Modal from 'react-modal';

interface DonationFormProps {
    onClose: () => void; 
}

const DonationForm: React.FC<DonationFormProps> = ({ onClose }) => {
    const [donationAmount, setDonationAmount] = useState(0);
    const [cartAmount, setCartAmount] = useState(0);

    const handleAmountChange = (event: { target: { value: string; }; }) => {
        setDonationAmount(parseFloat(event.target.value));
    };

    const handleCheckout = () => {
        setCartAmount(cartAmount + donationAmount);
        console.log(`Added $${donationAmount.toFixed(2)} to cart.`);
        // onClose(); // Close the modal
    };

    const handleCheckoutClick = () => {
        // console.log('fetching')
        fetch('http://localhost:3000/create-checkout-session', {
            method: 'POST', 
            headers: {
            'Content-Type': 'application/json', 
            },
            body: JSON.stringify({
            items: [
                { id: 1, quantity: 3 },
                { id: 2, quantity: 1 }
            ]
            })
        })
        .then(res => {
        if(res.ok) return res.json()
        return res.json().then(json => Promise.reject(json))
        }).then(( { url }) => {
        // window.location 
        console.log(url)
    }).catch(e => {
        console.error(e.error)
    })
    }

    return (
        <div>
        <h2>Donation Form</h2>
        <div>
            <input
                type="number"
                value={donationAmount}
                onChange={handleAmountChange}
                style={{
                    position: 'relative',
                    left: '-4px',
                    border: "2px solid #ccc", 
                    padding: "4px",           
                    borderRadius: "12px",      
                    fontSize: "16px",                     
                    boxSizing: "border-box",  
                }}
            />
            <button onClick={handleCheckout}
                className="text-center ml-1 bg-gray-900 text-white font-bold rounded-lg px-2 py-1 hover:bg-gray-600"
            > Add to Cart
            </button>
            <button onClick={onClose}
                className="text-center ml-1 bg-gray-900 text-white font-bold rounded-lg px-2 py-1 hover:bg-gray-600"
            > Cancel
            </button>

            <Link
                href="/checkout"
                className="text-center ml-1 bg-gray-900 text-white font-bold rounded-lg px-2 py-1 hover:bg-gray-600"
                onClick={handleCheckoutClick}
            >
                Checkout
            </Link>

            {cartAmount >= 0 && (
                <p>Current Cart Total: ${cartAmount.toFixed(2)}</p>
            )}
        </div>
        </div>
    );
};

export default DonationForm;
