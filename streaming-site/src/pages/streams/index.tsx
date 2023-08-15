import React, { useRef, useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Player from "../../components/player";
import { string, bool, number } from 'prop-types';


import Link from "next/link";

import { QuerySnapshot, collection, doc, getDocs, getDoc, query, where } from "firebase/firestore";
import { getFirebaseApp } from "../../utils/firebase.config";



function Streams(): JSX.Element {
  interface Stream {
    id: string;
    title: string;
    stream_url: string;
    thumbnail_url: string;
    category: string;
    streamer_id: number;
    view_count: number;
    start_time: number;
    end_time: number;
  }
  const [streams, setStreams] = useState<Stream[]>([]);




  useEffect(() => {
    const { auth, db } = getFirebaseApp();

    if (!auth || !db) {
      console.error("Firebase not available");
      return;
    }

    const fetchStreams = async () => {
      const streamsCollRef = collection(db, "streams");
      const usersCollRef = collection(db, "users");

      const querySnapshot = await getDocs(streamsCollRef);

      if (querySnapshot.empty) {
        console.error("Firebase Error: Streams Collection is empty or does not exist in firestore");
        return;
      }
      querySnapshot.forEach((doc) => {
        if (doc.data()['end_time']) return;
        const q = query(usersCollRef, where("id", "==", doc.data()['streamer_id']));
        setStreams([...streams, Object.assign( {}, doc.data())] as typeof streams);
      });

    }

    fetchStreams().catch(console.error)
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar></Navbar>
      <main className="flex-1">
        <div className="container mx-auto p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {streams.map((stream) => (
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
                    </div>

                    <div className="">
                      <Link href="/streamingroom1">
                        <div
                          className="relative"
                        >
                          <iframe
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/1280px-A_black_image.jpg"
                            className="absolute top-0 left-0 w-full h-full z-8"
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
                            <Link href="/streamingroom">
                              {stream.title}
                            </Link>
                          </h3>
                          <Link
                            href="/streamingroom"
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
        </div>
      </main>
      <Footer></Footer>
    </div>
  );
}

export default Streams;
