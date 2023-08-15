/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Player from "../../components/player";
import Link from "next/link";
import Modal from "react-modal";
import DonationForm from "../../components/donation-form";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseApp } from "../../utils/firebase.config";

function StreamingRoom(): JSX.Element {
  const [playerKey, setPlayerKey] = useState<number>(0);

  const [messages, setMessages] = useState<{ text: string; timestamp: Date }[]>(
    []
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  // const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [followedList, setFollowedList] = useState<string[]>([]);

  const formatTimestamp = (timestamp: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-US", options).format(timestamp);
  };

  const handleFollow = () => {
    const streamer = "StreamerUsername";

    if (!followedList.includes(streamer)) {
      setFollowedList([...followedList, streamer]);
    }
  };
  
  const [user, setUser] = useState<any>(null);



  const isFollowed = followedList.includes("StreamerUsername");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (inputRef.current) {
      const inputValue = inputRef.current.value.trim();
  
      if (inputValue === "") {
        alert("Message cannot be empty!");
      } else {
        setMessages([
          ...messages,
          { text: inputValue, timestamp: new Date() },
        ]);
        inputRef.current.value = "";
      }
    }
  };
  

  const openDonationModal = () => {
    setModalIsOpen(true);
  };


 
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="container mx-auto py-2 flex flex-col-reverse md:flex-row">
          <section className="w-full md:w-2/3 p-4">
            <div className="rounded overflow-hidden shadow-lg p-2 bg-white">
              <div className="relative">
                <Player
                  controls
                  autoplay
                  muted
                  preload="auto"
                  src="https://34.83.97.105/streams/obs/index.m3u8"
                />
              </div>
              <div className="mt-2">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png?w=740&t=st=1691147917~exp=1691148517~hmac=eb6166a62265ce27b7afac68d87a03b748bc37c5361e49e55c8ced8a2f60e2db"
                  className="mt-2 w-7 h-7 rounded-full float-left mr-2"
                  alt="Streamer avatar"
                />
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-xl mb-2">Stream Title</h2>
                  <div className="text-gray-600 text-m pt-2">
                    <button
                      className={`text-center ${
                        isFollowed ? "bg-gray-600" : "bg-gray-900"
                      } text-white font-bold rounded-lg px-2 py-1 hover:bg-gray-600`}
                      onClick={handleFollow}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="w-6 h-6 inline-block mr-1"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                      {isFollowed ? "Following" : "Follow"}
                    </button>

                    <button className="text-center ml-1 bg-gray-900 text-white font-bold rounded-lg px-2 py-1 hover:bg-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="w-6 h-6 inline-block mr-1"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                        />
                      </svg>
                      Share
                    </button>

                    <button
                      onClick={openDonationModal} // Open the modal on click
                      className="text-center ml-1 bg-gray-900 text-white font-bold rounded-lg px-2 py-1 hover:bg-gray-600"
                    >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 inline-block mr-1">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>

                      Donate
                    </button>

                    <Modal
                      isOpen={modalIsOpen}
                      onRequestClose={() => setModalIsOpen(false)}
                      contentLabel="Donation Modal"
                      style={{
                        overlay: {
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                        },
                        content: {
                          maxWidth: "800px",
                          maxHeight: "600px",
                          margin: "0 auto",
                          padding: "30px",
                        },
                      }}
                    >
                      <DonationForm onClose={() => setModalIsOpen(false)} />
                    </Modal>
                  </div>
                </div>

                <div className="flex justify-between items-center pl-9">
                  <p className="text-gray-700 text-base">
                    Stream description here...
                  </p>
                  <span className="flex text-gray-600 text-m pr-6 pt-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                      />
                    </svg>
                    123
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section
            className="flex flex-col justify-between w-full md:w-1/3 mt-4 pt-2 px-2 bg-white shadow-lg"
            style={{ maxWidth: "350px" }}
          >
            <div className="bg-white">
              <h2 className="font-bold text-center border-b-2 text-m pb-1">
                STREAM CHAT
              </h2>
              <div className="chat-container p-2 m-0 overflow-y-auto">
                {messages.map((message, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">test</span>
                      <span className="text-gray-400 text-xs">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <p>{message.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <form className="my-4 flex bg-white m" onSubmit={handleSubmit}>
              <input
                className="w-full rounded-l-lg p-2 border border-gray-900"
                type="text"
                placeholder="Write a message..."
                ref={inputRef}
              />
              <button className="py-2 px-2 bg-gray-900 text-white font-semibold hover:text-white border hover:bg-gray-600 border-gray-900 hover:border-transparent rounded-r-lg">
                Send
              </button>
            </form>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default StreamingRoom;
