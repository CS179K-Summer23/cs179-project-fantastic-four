import React, { useRef, useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Redirect from 'next/router'
import Link from "next/link";
import { onAuthStateChanged, updateEmail  } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";
import { getFirebaseApp } from "../../utils/firebase.config";

function isEmailValid(email: string): boolean {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

function Settingpage(): JSX.Element {
  type UserType = {
    name: string
    profilePicture: string
    email: string
    birthday: number,
    age: number,
    debit: number,
    stream_key: string
    title: string
    description: string
  }
  const [user, setProfile] = useState<any>(null);
  const [userChanges, setProfileChanges] = useState<any>({});
  const [userPublic, setPublicProfile] = useState<any>(null);
  const [userPublicChanges, setPublicProfileChanges] = useState<any>({});

  useEffect(() => {
    const { auth, db } = getFirebaseApp();

    if (!auth || !db ) {
      console.error("Firebase not available");
      return;
    }

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid } = user;
        const docRef = doc(db, "accounts", uid);
        
        getDoc(docRef).then((userData) => {
          if (!userData.exists()) {
            console.error("Firebase Error: User Account does not exist in firestore");
            return;
          }
          const userId = userData.data()['id']
          setProfile(userData.data() as UserType);
          setProfileChanges(userData.data() as UserType);

          getDoc(doc(db, "users", '' + userId)).then((userPublicData) => {
            if (!userPublicData.exists()) {
              console.error("Firebase Error: User User does not exist in firestore");
              return;
            }
  
            setPublicProfile(userPublicData.data() as typeof user);
            setPublicProfileChanges(userPublicData.data() as typeof user);
          });
        });


      } else {
        console.log("No user signed in");
        setProfile(null)
        setProfileChanges(null)
        setPublicProfile(null)
        setPublicProfileChanges(null)
        Redirect.push('/')
      }
    });

    return () => {
      unsubAuth()
    }
  }, []);

  //upload profile to firebase
  const updateUserProfile = async (updatedProfile: typeof user) => {
    const { auth, db } = getFirebaseApp();

    if (!auth || !db || !auth.currentUser) {
      console.error("Firebase not available or user not signed in");
      return;
    }

    const changes: any = Object.fromEntries(Object.entries(updatedProfile).filter(([k, v]) => user[k] !== v))

    setProfile({...user, ...changes})
    const accountChanges: any = {}
    if (changes['name']) {
      accountChanges['name'] = changes['name']
    }
    if (changes['email']) {
      accountChanges['email'] = changes['email']
    }

    if (!Object.keys(accountChanges).length) return

    const accountRef = doc(db, "accounts", auth.currentUser.uid);
    const userRef = doc(db, "users", '' + user.id);

    if (changes['email'] && !isEmailValid(updatedProfile.email)) {
      alert("Please enter a valid email address");
      return;
    }

    // if (changes['name'] && !isNameValid(updatedProfile.name)) {
    //   alert("Please enter a valid alphanumeric name with 3-10 characters. ");
    //   return;
    // }

    try {
      if (changes['name']) {
        await updateDoc(userRef, {name: changes['name']});
        await updateDoc(accountRef, {name: changes['name']});
      }

      if (changes['email']) {
        try {
          await updateEmail(auth.currentUser, changes['email'])
        }
        catch (error)  {
          console.log(error)
          alert('To change your email, Sign In again, then retry.')
          return Redirect.push('/signin')
        }
        await updateDoc(accountRef, {email: changes['email']});
      }

      console.log("Profile updated successfully");
      alert("Profile updated successfully!"); // Displaying an alert
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const updateUserPublicProfile = async (updatedProfile: typeof user) => {
    const { auth, db } = getFirebaseApp();

    if (!auth || !db || !auth.currentUser) {
      console.error("Firebase not available or user not signed in");
      return;
    }
    const changes: any = Object.fromEntries(Object.entries(updatedProfile).filter(([k, v]) => userPublic[k] !== v))
    if (!Object.keys(changes).length) return

    setPublicProfile({...userPublic, ...changes})
    
    const userRef = doc(db, "users", '' + user.id);
    
    try {
      await updateDoc(userRef, {...changes});
      if(userPublic.stream_id) {
        const streamRef = doc(db, "streams", '' + userPublic.stream_id);
        await updateDoc(streamRef, {...changes});
      }
      console.log("Stream info updated successfully");
      alert("Stream Info updated successfully!"); // Displaying an alert
    } catch (error) {
      console.error("Failed to update stream info", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProfileChanges({
      ...userChanges,
      [name]: value,
    });
  };

  const handlePublicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPublicProfileChanges({
      ...userPublicChanges,
      [name]: value,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar></Navbar>

      <main className="flex-1">
        {user && (<div className="container mx-auto px-8 py-6">
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
              <div className="grid grid-rows-5 gap-4 w-full">
                <div className="col-span-1">
                  <label htmlFor="name" className="text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userChanges?.name}
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
                    value={userChanges?.email}
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
                    value={userChanges?.birthday}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="StreamURL" className="text-gray-700">
                    StreamURL
                  </label>
                  <input
                    disabled
                    type="string"
                    name="StreamURL"
                    value="rtmp://34.83.113.52/live-stream"
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border cursor-not-allowed"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="streamkey" className="text-gray-700">
                    Streamkey
                  </label>
                  <input
                    disabled
                    type="string"
                    name="streamkey"
                    value={user?.stream_key}
                    onChange={handleChange}
                    className="w-full p-2 mt-1 rounded border cursor-not-allowed"
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
                onClick={() => updateUserProfile(userChanges)}
                className="float-right bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded mt-4"
              >
                Submit Changes
              </button>
            </div>
          </section>

          <section>
          <h2 className="mt-8 text-xl font-bold mb-4">Stream Settings</h2>
            <div className="rounded overflow-hidden shadow-lg p-4 bg-white relative">
              <div className="grid grid-rows-3 gap-4 w-full">
                <div className="col-span-1">
                  <label htmlFor="title" className="text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={userPublicChanges?.title}
                    onChange={handlePublicChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="description" className="text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={userPublicChanges?.description}
                    onChange={handlePublicChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="category" className="text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={userPublicChanges?.category}
                    onChange={handlePublicChange}
                    className="w-full p-2 mt-1 rounded border"
                  />
                </div>
              </div>
              <button
                onClick={() => updateUserPublicProfile(userPublicChanges)}
                className="float-right bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded mt-4"
              >
                Submit Changes
              </button>
            </div>
          </section>
        </div>)}
      </main>

      <Footer></Footer>
    </div>
  );
}

export default Settingpage;
