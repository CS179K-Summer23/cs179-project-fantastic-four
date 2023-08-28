/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import { doc, getDoc, getDocs, query, collection, where, onSnapshot, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Player from "../components/player";
import Modal from "react-modal";
import DonationForm from "../components/donation-form";
import Chat from '../components/chat';

import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseApp } from "../utils/firebase.config";

function StreamingRoom(): JSX.Element {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [followListLoading, setFollowListLoadingStatus] = useState<boolean>(true);
  const [followedList, setFollowedList] = useState<string[]>([]);

  const [streamLoading, setStreamLoading] = useState<boolean>(true)
  const [streamerLoading, setStreamerLoading] = useState<boolean>(true)
  const [stream, setStream] = useState<any>(null)
  const [streamer, setStreamer] = useState<any>(null)

  const [userLoading, setUserLoadingStatus] = useState<boolean>(true)
  const [user, setUser] = useState<any>(null)

  const router = useRouter()

  const handleFollow = async () => {
    const { db } = getFirebaseApp()

    const streamerUsername = router.query.stream;

    if (!db || !streamerUsername || userLoading) return;

    // user must be logged in to follow/unfolllow a streamer
    if (!user) {
      alert('Please login to follow this streamer');
      return;
    }

    const streamerQuery = query(collection(db, 'users'), where('name', '==', streamerUsername));
    const streamerUserId = await getDocs(streamerQuery).then((querySnapshot) => querySnapshot.docs[0].data().id);

    // user wants to unfollow the streamer
    if (followedList.includes(streamerUserId)) {
      const streamerFollowedRef = collection(db, 'follows');
      const streamerFollowedQuery = query(streamerFollowedRef, where('followerId', '==', user.uid), where('followingId', '==', streamerUserId));

      try {
        await deleteDoc((await getDocs(streamerFollowedQuery)).docs[0].ref);
      }
      catch (error) {
        console.error('Error deleting document', error);
        alert('Error unfollowing streamer');
      }

      setFollowedList(followedList.filter((followedId) => followedId !== streamerUserId));
    }
    // user wants to follow the streamer
    else {
      try {
        await addDoc(collection(db, 'follows'), {
          followerId: user.uid,
          followingId: streamerUserId,
          followTime: serverTimestamp(),
        })
      }
      catch (error) {
        console.error('Error adding document', error);
        alert('Error following streamer');
      }

      setFollowedList([...followedList, streamerUserId]);
    }
  };

  useEffect(() => {
    const { auth, db } = getFirebaseApp()

    if (!auth || !db) return

    onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const followedStreamersRef = collection(db, 'follows')
        const followDocs = await getDocs(query(followedStreamersRef, where('followerId', '==', fbUser.uid)))
        const userProfile = await getDoc(doc(db, 'users', fbUser.uid)).then((doc) => doc.data())

        setUser({
          ...userProfile,
          uid: fbUser.uid,
        })
        setFollowedList(followDocs.docs.map((followDoc) => followDoc.data().followingId))

        setFollowListLoadingStatus(false)
        setUserLoadingStatus(false)
      }
      else {
        setFollowListLoadingStatus(false)
        setUserLoadingStatus(false)
      }
    })
  }, [])

  useEffect(() => {
    (async function() {
      const { db } = getFirebaseApp()
      if (!db) return

      const queryUser: any = router.query.stream;
      if (!queryUser) return;

      const streamerQuery = query(
        collection(db, "users"), 
        where("name", "==", queryUser)
      );      
      const streamerSnapshot = await getDocs(streamerQuery);
      if (streamerSnapshot.empty) {setStreamerLoading(false); return; }

      const streamerData = streamerSnapshot.docs[0].data();
      setStreamer(streamerData)
      setStreamerLoading(false)
      
      if (!(streamerData['stream_id'])) {setStreamLoading(false); return; }
      
      const streamRef = doc(db, 'streams', streamerData['stream_id']);
      const unsubStream = onSnapshot(streamRef, async (streamSnap) => {

        if (streamSnap.exists()) {
          setStream(streamSnap.data())
        }
      });
      setStreamLoading(false)

      return () => unsubStream();

    }())
  }, [router])

  const openDonationModal = () => {
    setModalIsOpen(true);
  };

  const isFollowed = followedList.includes(streamer?.id);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="container mx-auto py-2 flex flex-col-reverse md:flex-row">
          <section className="w-full md:w-2/3 p-4">
            <div className="rounded overflow-hidden shadow-lg p-2 bg-white">
            <div className="relative aspect-video" >
                {stream !== null && !streamLoading &&
                (<Player
                  controls
                  autoplay
                  muted
                  preload="auto"
                  src={stream?.stream_url}
                />)}
                {/* {
                  streamer && streamLoading == false && (
                    <div className="absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
                      <p className="text-black text-2xl">Loading...</p>
                    </div>
                  )
                } */}
                {
                  !streamerLoading && !streamer && (
                    <div className="absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
                      <p className="text-black text-2xl">No streamer with this name exists</p>
                    </div>
                  )
                }
                {
                  streamer && !streamLoading && !stream &&  (
                    <div className="absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
                      <p className="text-black text-2xl">{streamer?.name} is not currently live</p>
                    </div>
                  )
                }
              </div>
              <div className="mt-2">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png?w=740&t=st=1691147917~exp=1691148517~hmac=eb6166a62265ce27b7afac68d87a03b748bc37c5361e49e55c8ced8a2f60e2db"
                  className="mt-2 w-7 h-7 rounded-full float-left mr-2"
                  alt="Streamer avatar"
                />
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-xl mb-2">{stream?.title || streamer?.title}</h2>
                  <div className="text-gray-600 text-m pt-2">
                  <button
                      className={`text-center ${
                       followListLoading ? "bg-gray-900" : isFollowed ? "bg-red-600" : "bg-gray-900"
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
                      {followListLoading ? "Loading..." : isFollowed ? "Unfollow" : "Follow"}
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
                    {streamer?.name}
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
                    {stream?.view_count}
                  </span>
                </div>
              </div>
            </div>
          </section>
          <Chat streamerId={streamer?.id} />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default StreamingRoom
