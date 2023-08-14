import React, { useRef, useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";
import { getFirebaseApp } from "../../utils/firebase.config";

function isEmailValid(email: string): boolean {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

function Settingpage(): JSX.Element {
  const [user, setProfile] = useState({
    name: "",
    profilePicture: "",
    email: "",
    birthday: 0,
    age: 0,
    debit: 0,
  });

  useEffect(() => {
    const { auth, db } = getFirebaseApp();

    if (!auth || !db) {
      console.error("Firebase not available");
      return;
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid } = user;
        const docRef = doc(db, "users", uid);

        getDoc(docRef).then((userData) => {
          if (!userData.exists()) {
            console.error("Firebase Error: User does not exist in firestore");
            return;
          }

          setProfile(userData.data() as typeof user);
        });
      } else {
        console.log("No user signed in");
      }
    });
  }, []);

  //upload profile to firebase
  const updateUserProfile = async (updatedProfile: typeof user) => {
    const { auth, db } = getFirebaseApp();

    if (!auth || !db || !auth.currentUser) {
      console.error("Firebase not available or user not signed in");
      return;
    }

    const userRef = doc(db, "users", auth.currentUser.uid);
    if (!isEmailValid(updatedProfile.email)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      await updateDoc(userRef, updatedProfile);
      console.log("Profile updated successfully");
      alert("Profile updated successfully!"); // Displaying an alert
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProfile({
      ...user,
      [name]: value,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar></Navbar>

      <main className="flex-1">
        <div className="container mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold mb-4">Settings</h1>
          <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
            <div className="rounded overflow-hidden shadow-lg p-4 bg-white relative flex items-center">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-20 h-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {/* <img
                  src={
                    profile.profilePicture ||
                    "path/to/default/profile/picture.png"
                  }
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                /> */}
                <input type="file" name="profilePicture" className="ml-4" />
                <button className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded ml-4">
                  Update Profile Picture
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
            <div className="rounded overflow-hidden shadow-lg p-4 bg-white relative">
              <div className="grid grid-rows-4 gap-4 w-full">
                <div className="col-span-1">
                  <label htmlFor="name" className="text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={user?.name}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="email" className="text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={user?.email}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="birthday" className="text-gray-700">
                    Birthday
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={user?.birthday}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="debit" className="text-gray-700">
                    Debit
                  </label>
                  <input
                    disabled
                    type="number"
                    name="debit"
                    value={user?.debit}
                    className="w-full p-2 mt-1 rounded border cursor-not-allowed"
                  />
                </div>
              </div>
              <button
                onClick={() => updateUserProfile(user)}
                className="float-right bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded mt-4"
              >
                Submit Changes
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer></Footer>
    </div>
  );
}

export default Settingpage;
