/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Player from "../../components/player";

import Link from "next/link";

function Homepage(): JSX.Element {
  const categories = ["Following", "VALORANT", "League of Legends"];
  const streams = [1, 2, 3];
  const videos = [
    "https://34.83.97.105/streams/spacex/index.m3u8",
    "https://34.83.97.105/streams/obs/index.m3u8",
    "https://34.83.97.105/streams/mobile/index.m3u8",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextVideo = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + videos.length) % videos.length
    );
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar></Navbar>

      <main className="flex-1">
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold my-4">Settings</h1>
          <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700"/>

          <section>
            <h2 className="text-xl font-bold my-4">Profile Picture</h2>
              <div className="justify-between flex rounded overflow-hidden shadow-lg p-4 bg-white relative">
                <div className="flex">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="w-16 h-16"
                  >
                  <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  </svg>

                  <div>
                    <button>Add Profile Picture</button>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold my-4">Profile Settings</h2>
                <div className="flex rounded overflow-hidden shadow-lg p-4 bg-white relative">
                  <div className="divide-y divide-slate-200">
                    <div className="flex">
                      username
                      <form className="text-sm ml-10">
                        <input
                          className="bg-grey-lighter rounded pl-1 w-full"
                          type="text  "
                          placeholder="username"
                        />
                      </form>  
                    </div>
                    <div className="flex">
                      birthday
                      <form className="text-sm ml-10">
                        <input
                          className="bg-grey-lighter rounded pl-1 w-full"
                          type="text  "
                          placeholder="username"
                        />
                      </form>  
                    </div>
                    <div className="flex">
                      age
                      <form className="text-sm ml-10">
                        <input
                          className="bg-grey-lighter rounded pl-1 w-full"
                          type="text  "
                          placeholder="username"
                        />
                      </form>  
                    </div>
                    <div className="flex">
                      email
                      <form className="text-sm ml-10">
                        <input
                          className="bg-grey-lighter rounded pl-1 w-full"
                          type="text  "
                          placeholder="username"
                        />
                      </form>  
                    </div>
                </div>
              </div>
            </section>
          </div>
      </main>

      <Footer></Footer>
    </div>
  );
}

export default Homepage;
