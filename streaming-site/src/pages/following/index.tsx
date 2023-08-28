import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

import Image from "next/image";
import Link from "next/link";

import { onAuthStateChanged } from 'firebase/auth'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { getFirebaseApp } from '../../utils/firebase.config'

type Stream = {
  id: string
  title: string
  description: string
}

function Followingpage(): JSX.Element {
  const categories = ["Following"];

  const [streamsLoading, setStreamLoadingStatus] = useState<boolean>(true);
  const [streams, setStreams] = useState<Stream[]>([]);

  useEffect(() => {
    const { db, auth } = getFirebaseApp()

    if (!db || !auth) return;

    let unsubscribeFollowing: any = null;
    let unsubscribeStreams: any = null;

    onAuthStateChanged(auth, (user) => {
      if (user) {
        // get following list
        const followingQuery = query(collection(db, 'follows'), where('followerId', '==', user.uid))

        unsubscribeFollowing = onSnapshot(followingQuery, (followingSnapshot) => {
          const following = followingSnapshot.docs.map((doc) => doc.data().followingId)

          // get streams from following list
          const streamersQuery = query(collection(db, 'streams'), where('streamer_id', 'in', following))

          unsubscribeStreams = onSnapshot(streamersQuery, (streamsSnapshot) => {
            const streams = streamsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Stream))
            setStreams(streams)
          })
        })

        setStreamLoadingStatus(false)
      }
      else {
        setStreamLoadingStatus(false)
      }
    })

    return () => {
      if (unsubscribeFollowing !== null) {
        unsubscribeFollowing()
      }

      if (unsubscribeStreams !== null) {
        unsubscribeStreams()
      }
    };
  }, [])

  console.log('streams', streams)

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto p-8">
          {categories.map((category) => (
            <section key={category}>
              <h2 className="text-2xl font-bold my-4">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {!streamsLoading && streams.length > 0 && streams.map((stream) => (
                  <div
                    key={stream.id}
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
                          />
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
                        <Image
                          src="https://cdn-icons-png.flaticon.com/512/149/149071.png?w=740&t=st=1691147917~exp=1691148517~hmac=eb6166a62265ce27b7afac68d87a03b748bc37c5361e49e55c8ced8a2f60e2db"
                          className="mt-2 w-7 h-7 rounded-full float-left mr-2"
                          alt="Streamer avatar"
                          width={100}
                          height={100}
                        />
                        <div className="pl-9">
                          <h3 className="font-bold text-xl hover:text-gray-500">
                            <Link href="/streamingroom">
                              Stream Title {stream.title}
                            </Link>
                          </h3>
                          <Link
                            href="/streamingroom"
                            className="text-sm text-gray-700 hover:text-gray-500"
                          >
                            {stream.description}
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

      <Footer />
    </div>
  );
}

export default Followingpage;
