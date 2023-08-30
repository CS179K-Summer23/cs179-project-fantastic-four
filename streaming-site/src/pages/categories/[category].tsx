import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  getDocs,
  query,
  collection,
  where,
  onSnapshot,
} from "firebase/firestore";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Player from "../../components/player";
import Modal from "react-modal";
import Link from "next/link";
import { getFirebaseApp } from "../../utils/firebase.config";

function CategoryLists(): JSX.Element {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(true);
  const [stream, setLivestream] = useState<any[]>([]);
  const [streamLoading, setStreamLoading] = useState<boolean>(true);
  const [streamName, setStreamerName] = useState<any[]>([]);

  const router = useRouter();
  const queryCategory: any = router.query.category;

  useEffect(() => {
    (async function () {
      const { db } = getFirebaseApp();
      if (!db) return;

      if (!queryCategory) return;

      const categoryQuery = query(
        collection(db, "categories"),
        where("name", "==", queryCategory)
      );

      const unsubCategory = onSnapshot(categoryQuery, async (categorySnap) => {
        const categoriesData: any[] = [];
        categorySnap.forEach((doc) => {
          categoriesData.push(doc.data());
        });

        setCategories(categoriesData);
        setCategoryLoading(false);

        const streamQuery = query(
          collection(db, "streams"),
          where("category", "==", queryCategory)
        );

        const unsubStream = onSnapshot(streamQuery, async (streamSnap) => {
          const streamsData: any[] = [];
          const streamerNames: any[] = [];

          streamSnap.forEach(async (doc) => {
            const streamData = doc.data();
            if (streamData.end_time === null) {
              streamsData.push(streamData);

              const streamerSnapshot = await getDocs(
                query(
                  collection(db, "users"),
                  where("id", "==", streamData.streamer_id)
                )
              );

              if (!streamerSnapshot.empty) {
                streamerNames.push(streamerSnapshot.docs[0].data().name);
                // setStreamerName(streamName);
                // console.log(setStreamerName(streamName));

                // console.log(streamerNames);
              }
            }
          });

          setLivestream(streamsData);
          setStreamerName(streamerNames);
          console.log(streamName);
          setStreamLoading(false);
        });

        return () => unsubStream();
      });

      return () => unsubCategory();
    })();
  }, [router, queryCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar></Navbar>
      <main className="flex-1">
        <div className="container mx-auto p-8">
          {categoryLoading || streamLoading ? (
            <div>Loading...</div>
          ) : (
            <div>
              {categories.map((category, index) => (
                <div key={index}>
                  <h1 className="text-2xl font-semibold mb-4">
                    {category.name}
                  </h1>
                  <p>{category.description}</p>
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {stream.map((stream, index) => (
                  <div
                    key={stream.id}
                    className="rounded overflow-hidden shadow-lg p-4 bg-white"
                  >
                    <Link href={`/${stream.name}`}>
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

                      <div className="flex justify-between items-center text-center">
                        <p className="text-gray-700">{stream[index]}</p>
                        <span className="text-gray-500">
                          {streamName[stream[index]]}
                        </span>{" "}
                        <span className="flex text-gray-600 text-m pt-2">
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
                              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                            />
                          </svg>
                          {stream?.view_count}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer></Footer>
    </div>
  );
}

export default CategoryLists;
