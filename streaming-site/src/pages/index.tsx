import React, { useRef, useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Player from "../components/player";
import { string, bool, number } from "prop-types";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

import Link from "next/link";

import {
  QuerySnapshot,
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  QueryOrderByConstraint,
} from "firebase/firestore";
import { getFirebaseApp } from "../utils/firebase.config";

function Streams(): JSX.Element {
  interface Stream {
    id: string;
    title: string;
    stream_url: string;
    thumbnail_url: string;
    description: string;
    category: string;
    streamer_id: number;
    view_count: number;
    start_time: number;
    end_time: number;
    name: string;
  }

  interface Streamer {
    id: string;
    name: string;
    avatar_url: string;
  }

  const [streams, setStreams] = useState<any>(null);
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState(new Set());
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // console.log(streams);

  const handlePrevClick = () => {
    if (streams && streams.length > 0) {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else {
        // Loop back to the end of the array
        setCurrentIndex(streams.length - 1);
      }
    }
    console.log(currentIndex);
  };

  const handleNextClick = () => {
    if (streams && streams.length > 0) {
      if (currentIndex < streams.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Loop back to the start of the array
        setCurrentIndex(0);
      }
    }
    console.log(currentIndex);
  };

  useEffect(() => {
    const { auth, db } = getFirebaseApp();

    if (!auth || !db) {
      console.error("Firebase not available");
      return;
    }
    if (streams) return;
    const usersRef = collection(db, "users");

    const fetchStreamer = async (streamer_id: string) => {
      const streamerQuery = query(usersRef, where("id", "==", streamer_id));

      const userSnapshot = await getDocs(streamerQuery);
      return userSnapshot.docs[0].data();
    };

    const fetchStreams = async () => {
      const streamsQuery = query(
        collection(db, "streams"),
        orderBy("view_count", "desc")
      );

      const streamsSnapshot = await getDocs(streamsQuery);

      const streamsArr: any[] = await Promise.all(
        streamsSnapshot.docs
          .filter((stream) => stream.data()["end_time"] === null)
          .map(async (stream) => {
            return stream.data();
          })
      );

      const streamersArr: any[] = await Promise.all(
        streamsArr.map(async (stream) => {
          return await fetchStreamer(stream["streamer_id"]).then(
            async (data) => {
              return data;
            }
          );
        })
      );

      return [streamsArr, streamersArr];
    };

    const fetchCategories = async () => {
      const streamsQuery = query(collection(db, "streams"));
      const streamsSnapshot = await getDocs(streamsQuery);

      const categoriesArr: string[] = streamsSnapshot.docs
        .filter((stream) => stream.data()["end_time"] === null)
        .map((stream) => stream.data().category);

      const uniqueCategories = new Set(categoriesArr);

      return uniqueCategories;
    };

    Promise.all([fetchStreams(), fetchCategories()])
      .then((results) => {
        const [streamsData, uniqueCategories] = results;

        if (streamsData[0]) setStreams(streamsData[0]);
        if (streamsData[1]) setStreamers(streamsData[1]);
        if (uniqueCategories) setUniqueCategories(uniqueCategories);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [streamers, streams, uniqueCategories]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <button
          type="button"
          className="bg-gray-900 h-max w-max rounded-lg text-teal-400 font-bold hover:bg-indigo-300 hover:cursor-not-allowed duration-[500ms,800ms]"
          disabled
        >
          <div className="flex items-center justify-center m-[10px]">
            <div className="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-teal-400 border-4"></div>
            <div className="ml-2">Processing...</div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar></Navbar>
      <main className="flex-1">
        {/*Display the max 3 streams*/}
        <section className="container mx-auto p-8 relative">
          {/*Overlay button*/}
          <div className="absolute top-60 z-30 left-10 p-10">
            <button
              onClick={handlePrevClick}
              className="flex items-center justify-center bg-white p-2 rounded shadow-lg w-10 text-center hover:bg-gray-300"
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
          </div>

          <div className="absolute top-60 right-10 z-30 p-10">
            <button
              onClick={handleNextClick}
              className="flex items-center justify-center bg-white p-2 rounded shadow-lg w-10 text-center hover:bg-gray-300"
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
          </div>

          <div className="bg-gray">
            {streams &&
              streams
                .slice(currentIndex, currentIndex + 1)
                .map((stream: Stream, i: number) => (
                  <Link href={"/" + streamers[i].name} key={i}>
                    <div
                      key={stream.id}
                      className="rounded overflow-hidden shadow-lg p-4 bg-white relative"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <div className="relative pb-3/2 p-10 rounded-md">
                        <Player
                          autoplay
                          muted
                          preload="auto"
                          src={stream.stream_url}
                          poster={stream.thumbnail_url}
                        />
                        <div className="absolute top-10 left-10 z-10 bg-red-500 text-white px-2 py-1 text-lg font-bold uppercase">
                          Live
                        </div>

                        {isHovered && (
                          <div className="absolute top-20 left-20">
                            <div className="float-left">
                              {" "}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="white"
                                className="w-20 h-20 inline-block mr-1"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </div>
                            <div className="float-right">
                              <h2 className="text-white underline font-bold text-lg">
                                {" "}
                                {streamers[i].name}
                              </h2>
                              <p className="text-white">{stream.description}</p>
                              <p className="text-white">
                                Playing{" "}
                                <span className="underline">
                                  <Link href={"/categories/" + stream.category}>
                                    {stream.category}
                                  </Link>
                                </span>{" "}
                                for {stream.view_count} viewers
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </section>

        {/*Display all categories*/}
        <section className="container mx-auto p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from(uniqueCategories).map((category: any, index) => (
              <div
                key={index}
                className="rounded overflow-hidden shadow-lg px-4 pt-2 py-4 bg-white"
              >
                <Link href={"/categories/" + category}>
                  <h2 className="text-xl font-bold hover:text-gray-500">
                    {category}
                  </h2>
                </Link>

                {/*Display matched live channels*/}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {streams &&
                    streams
                      .filter((stream: Stream) => stream.category === category)
                      .slice(0, 4)
                      .map((filteredStream: Stream, i: number) => (
                        <Link href={"/" + streamers[i].name} key={i}>
                          <div
                            key={filteredStream.id}
                            className="rounded overflow-hidden"
                          >
                            <div className="relative pb-3/2">
                              <Player
                                autoplay
                                muted
                                preload="auto"
                                src={filteredStream.stream_url}
                                poster={filteredStream.thumbnail_url}
                              />
                            </div>
                          </div>
                        </Link>
                      ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/*Display all live channels*/}
        <section className="container mx-auto p-8">
          <h1 className="text-2xl font-semibold mb-4"> Live Channels</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {streams &&
              streams.map((stream: Stream, i: number) => (
                <Link href={"/" + streamers[i].name} key={i}>
                  <div
                    key={stream.id}
                    className="rounded overflow-hidden shadow-lg p-4 bg-white"
                  >
                    <div className="relative pb-3/2">
                      <Player
                        autoplay
                        muted
                        preload="auto"
                        src={stream.stream_url}
                        poster={stream.thumbnail_url}
                      />
                      <div className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 text-xs font-bold uppercase">
                        Live
                      </div>
                    </div>

                    <div className="">
                      <section>
                        <div className="flex p-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            className="w-8 h-8 inline-block mr-1"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>

                          <h3 className="font-bold text-xl hover:text-gray-500">
                            {stream.title}
                          </h3>
                        </div>

                        <div className="flex justify-between items-center text-gray-500 pl-10">
                          <Link
                            href={"/" + streamers[i].name}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            {streamers[i].name}
                          </Link>

                          <span className="flex justify-end items-center text-gray-500">
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
                            {stream?.view_count}
                          </span>
                        </div>
                      </section>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </main>
      <Footer></Footer>
    </div>
  );
}

export default Streams;
