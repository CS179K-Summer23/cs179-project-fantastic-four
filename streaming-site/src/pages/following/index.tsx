import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Player from "../../components/player";

import Image from "next/image";
import Link from "next/link";

import { onAuthStateChanged } from 'firebase/auth'
import { collection, getDoc, doc, onSnapshot, query, where } from 'firebase/firestore'
import { getFirebaseApp } from '../../utils/firebase.config'

type Stream = {
  id: string,
  title: string,
  description: string,
  streamerName: string,
  stream_url: string,
  thumbnail_url: string,
  view_count: number
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

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // get following list
        const followingQuery = query(collection(db, 'follows'), where('followerId', '==', user.uid))

        unsubscribeFollowing = onSnapshot(followingQuery, (followingSnapshot) => {
          const following = followingSnapshot.docs.map((doc) => doc.data().followingId)
          if(following.length === 0) return

          // get streams from following list
          const streamersQuery = query(collection(db, 'streams'), where('streamer_id', 'in', following), where('end_time', '==', null))

          unsubscribeStreams = onSnapshot(streamersQuery, async (streamsSnapshot) => {
            const streams: any = await Promise.all(streamsSnapshot.docs.map(async (streamDoc) => {
              const streamData: any = streamDoc.data();
              const streamerId = streamData.streamer_id;
              const streamId = streamData.id;
              const streamerRef = doc(db, 'users', '' + streamerId)
              const streamerSnap = await getDoc(streamerRef);
              if(!streamerSnap.exists) {console.error('streamer not found for stream', streamId); return;}

              const streamerData: any = streamerSnap.data()

              return {
                streamerName: streamerData['name'],
                id: streamDoc.id,
                ...streamData
              } as Stream
              }))

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
      unsubAuth()
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
                {!streamsLoading && streams.length > 0 && streams.map((stream, i) => (
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
                    <Link href={'/' + stream?.streamerName}>
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
                          <Link href={'/' + stream?.streamerName}>
                            {stream.title}
                          </Link>
                        </h3>
                        <div className="flex justify-between items-center">

                        <Link
                          href={'/' + stream?.streamerName}
                          className="text-sm text-gray-700 hover:text-gray-500"
                        >
                          {stream?.streamerName}
                        </Link>
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
                  {stream?.view_count}
                </span>
                      </div>
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