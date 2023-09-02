import React, { useRef, useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Player from "../../components/player";
import { string, bool, number } from "prop-types";

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
import { getFirebaseApp } from "../../utils/firebase.config";
import { useRouter } from "next/router";

function Category(): JSX.Element {
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
  }

  interface Streamer {
    id: string;
    name: string;
    avatar_url: string;
  }

  const [streams, setStreams] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [isLoading, setLoading] = useState<any>(true);
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const router = useRouter();

  const queryCategory: any = router.query.category;

  useEffect(() => {
    const { auth, db } = getFirebaseApp();

    if (!auth || !db) {
      console.error("Firebase not available");
      return;
    }

    if (!queryCategory) return;

    if (!isLoading) return;
    const usersRef = collection(db, "users");

    const fetchStreamer = async (streamer_id: number) => {
      const streamerQuery = query(usersRef, where("id", "==", streamer_id));

      const userSnapshot = await getDocs(streamerQuery);
      console.log('a', userSnapshot.docs[0].data() )
      return userSnapshot.docs[0].data();
    };

    const fetchStreams = async (category_name: string) => {
      const streamsQuery = query(
        collection(db, "streams"),
        where("category", "==", category_name)
      );

      const streamsSnapshot = await getDocs(streamsQuery);

      const streamsArr: any[] = await Promise.all(
        streamsSnapshot.docs
          .filter((stream: any) => stream.data()["end_time"] === null)
          .map(async (stream: any) => {
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
      
      console.log(streamersArr, streamersArr)
      return [streamsArr, streamersArr];
    };

    const fetchCategoy = async (category_name: string) => {
        const categoryQuery = query(
            collection(db, "categories"),
            where("name", "==", category_name)
          );
      const categorySnap = await getDocs(categoryQuery);

      if(categorySnap.empty) return;

      console.log(categorySnap.docs[0].data())
      return categorySnap.docs[0].data()

    };
    const fetchAll = async () => {
      await Promise.all([fetchStreams(queryCategory), fetchCategoy(queryCategory)])
        .then((results) => {
          const [streamsData, categoryData] = results;
          
          if (categoryData) setCategory(categoryData);
          if (streamsData[0]) setStreams(streamsData[0]);
          if (streamsData[1]) setStreamers(streamsData[1]);
          console.log(streamsData[0], streamsData[1], categoryData)
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };

    console.log('a')
    fetchAll()
  }, [queryCategory, isLoading]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar></Navbar>
      <main className="flex-1">
        <div className="container mx-auto p-8">
         {!isLoading && (
            <div>
                <div>
                  <h1 className="text-2xl font-semibold mb-4">
                    {category.name}
                  </h1>
                  <p>{category.description}</p>
                </div>
              

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {!isLoading && streams && (streams.map((stream: any, i: number) => (
                  <div
                    key={i}
                    className="rounded overflow-hidden shadow-lg p-4 bg-white"
                  >
                    <Link href={`/${streamers[i].name}`}>
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

                      <div className="flex p-1">
                             

                             <h3 className="overflow-hidden whitespace-nowrap text-ellipsis font-bold text-xl hover:text-gray-500">
                               {stream.title}
                             </h3>
                           </div>
                           <Link href={"/categories/" + stream?.category}>
                           <span className="hover:bg-gray-400 rounded-lg text-xs p-1 font-bold bg-gray-300">
                             {stream?.category}
                           </span>
                           </Link>
                           <div className="flex mt-2 items-center text-gray-500 ">
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
                             <Link
                               href={"/" + streamers[i].name}
                               className="text-gray-600 hover:text-gray-800"
                             >
                               {streamers[i].name}
                             </Link>

                             <span className="flex  grow justify-end items-center text-gray-500">
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
                    </Link>
                  </div>
                )))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer></Footer>
    </div>
  );
}
export default Category;
