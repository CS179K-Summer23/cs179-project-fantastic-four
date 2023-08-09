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
          <section>
            <div className="rounded overflow-hidden shadow-lg p-4 bg-white relative">
              <div className="relative pb-3/2 p-4">
                <button
                  onClick={prevVideo}
                  className="z-10 absolute top-1/2 left-0 transform -translate-y-1/2 p-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
                >
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
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextVideo}
                  className="z-10 absolute top-1/2 right-0 transform -translate-y-1/2 p-2 bg-gray-300 hover:bg-gray-400 rounded-lg "
                >
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
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
                <Link href="/streamingroom1">
                  <div
                    className="relative w-full cursor-pointer"
                  >
                    <div className="relative pb-3/2">
                      <Player
                        autoplay
                        muted
                        controls
                        preload="auto"
                        src={videos[currentIndex]}
                        // src='https://34.83.97.105/streams/obs/index.m3u8'
                      />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          {categories.map((category) => (
            <section key={category}>
              <h2 className="text-2xl font-bold my-4">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {streams.map((stream) => (
                  <div
                    key={stream}
                    className="rounded overflow-hidden shadow-lg p-4 bg-white"
                  >
                    <div className="relative pb-3/2">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src="https://www.youtube.com/embed/SqcY0GlETPk"
                        allowFullScreen
                      ></iframe>
                    </div>

                    <div className="">
                      <Link href="/streamingroom1">
                        <div
                          className="relative"
                          style={{ paddingBottom: "56.25%" }}
                        >
                          <iframe
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/1280px-A_black_image.jpg"
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              zIndex: 1,
                            }}
                            frameBorder="0"
                            scrolling="no"
                            allowFullScreen={true}
                          ></iframe>
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              zIndex: 2, 
                            }}
                          ></div>
                        </div>
                      </Link>

                      <div>
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/149/149071.png?w=740&t=st=1691147917~exp=1691148517~hmac=eb6166a62265ce27b7afac68d87a03b748bc37c5361e49e55c8ced8a2f60e2db"
                          className="mt-2 w-7 h-7 rounded-full float-left mr-2"
                          alt="Streamer avatar"
                        />
                        <div className="pl-9">
                          <h3 className="font-bold text-xl hover:text-gray-500">
                            <Link href="/streamingroom3">
                              Stream Title {stream}
                            </Link>
                          </h3>
                          <Link
                            href="/streamingroom2"
                            className="text-sm text-gray-700 hover:text-gray-500"
                          >
                            Stream description here...
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer></Footer>
    </div>
  );
}

export default Homepage;
