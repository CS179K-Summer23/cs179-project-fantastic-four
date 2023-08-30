/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router'
import { doc, getDoc, getDocs, query, collection, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, updateDoc } from "firebase/firestore";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Player from "../components/player";
import Modal from "react-modal";
import DonationForm from "../components/donation-form";
import Chat from '../components/chat';
import Bans from "../components/bans";
import Mods from "../components/mods";

import { Unsubscribe, onAuthStateChanged } from "firebase/auth";
import { getFirebaseApp } from "../utils/firebase.config";


function StreamingRoom(): JSX.Element { 
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalManageBansIsOpen, setModalManageBansIsOpen] = useState(false);
  const [modalManageModsIsOpen, setModalManageModsIsOpen] = useState(false);
  const [followListLoading, setFollowListLoadingStatus] = useState<boolean>(true);

  const [followedList, setFollowedList] = useState<string[]>([]);

  const [streamLoading, setStreamLoading] = useState<boolean>(true)
  const [streamerLoading, setStreamerLoading] = useState<boolean>(true)
  const [streamer, setStreamer] = useState<any>(null)
  const [userLoading, setUserLoadingStatus] = useState<boolean>(true)
  const [stream, setStream] = useState<any>(null)
  const [isStreamerBanned, setStreamerBanned] = useState<boolean>(false)
  const [isLoadingUser, setLoadingUser] = useState<boolean>(true)
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<any>(null);
  const [isStreamer, setStreamerStatus] = useState(false)
  const [isMod, setModStatus] = useState(false)
  const [isAdmin, setAdminStatus] = useState(false)

  const unsubStreamRef = useRef<Unsubscribe>();
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
const handleBan = async () => {
  const { auth, db } = getFirebaseApp();

  if (!auth || !db || !auth.currentUser) {
    console.error("Firebase not available or user not signed in");
    return;
  }

  if (!isAdmin) return

  const accountQuery = query(
    collection(db, "accounts"),
    where("id", "==", streamer.id)
  )

  const userRef = doc(db, "users", '' + streamer.id);

  const accountSnap = await getDocs(accountQuery);

  if(accountSnap.empty) {
    console.log('ban error: streamer account not found in firestore')
    return
    }
    const accountRef = accountSnap.docs[0].ref;

    const confirmation = confirm(`Press Ok to Ban ${streamer?.name}.`)

    if(!confirmation) return;
    await updateDoc(userRef, {banned: !isStreamerBanned});
    await updateDoc(accountRef, {banned: !isStreamerBanned });

    setStreamerBanned(!isStreamerBanned)
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
      const { db, auth } = getFirebaseApp()
      if (!db) return

      const queryUser: any = router.query.stream;
      if (!queryUser) return;

      const streamerQuery = query(
        collection(db, "users"), 
        where("name", "==", queryUser)
      );            
      let streamerId_: any = null;

      const unsubStreamer = onSnapshot(streamerQuery, async (streamerSnap) => {
        if (streamerSnap.empty) {setStreamer(null); setStreamerLoading(false); return; }

        const streamerData = streamerSnap.docs[0].data();
        streamerId_ = streamerData['id']
        setStreamer(streamerData)
        
        if (streamerData['banned']) {
          setStreamerBanned(true); 
          setStreamerLoading(false); 
          setStreamLoading(false);
          return; 
        }
        setStreamerBanned(false)
        setStreamerLoading(false)
        
        if (!(streamerData['stream_id'])) {setStreamLoading(false); return; }

        const streamRef = doc(db, 'streams', streamerData['stream_id']);
        unsubStreamRef.current = onSnapshot(streamRef, async (streamSnap) => {

          if (streamSnap.exists() && !streamSnap.data()['end_time']) {
            setStream(streamSnap.data())
          }
          else setStream(null)
          setStreamLoading(false)
        });
      });
      
      const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => { 
        if (firebaseUser) {
          setUser(firebaseUser)

          await getDoc(doc(db, 'accounts', firebaseUser.uid))
          .then(async (data) => {
            if (!data.exists()) {
              console.log('logged in user does not have an account in firestore')
              setLoadingUser(false)
              return
            }

            const userId = data.data()['id']
            setUserId(userId) 

            // Check if User is Global Admin
            getDoc(doc(db, "admins", '' + userId)).then((data) => { 
              if (data.exists()) {
                setAdminStatus(true);
              }
            })

            // Check if User is Mod in this Stream
            const modQuery = query(
              collection(db, "mods"),
              where("modId", "==", userId),
              where("streamerId", "==", streamer?.id || streamerId_)
            )

            const modSnap = await getDocs(modQuery);

            if(!modSnap.empty) setModStatus(true);
          })

        } else {
          setUser(null)
        }
        setLoadingUser(false)
      })

      return () => {
        unsubStreamer();
        unsubStreamRef.current && unsubStreamRef.current();
        unsubAuth();
      }

    }())
  }, [router, streamer?.id])

  const openDonationModal = () => {
    setModalIsOpen(true);
  };

  const isFollowed = followedList.includes(streamer?.id);

  const openManageBansModal = () => {
    setModalManageBansIsOpen(true);
  };

  const openManageModsModal = () => {
    setModalManageModsIsOpen(true);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="container mx-auto py-2 flex flex-col-reverse md:flex-row">
          <section className="w-full md:w-2/3 p-4">
            <div className="rounded overflow-hidden shadow-lg p-2 bg-white">
            <div className="relative aspect-video" >
                {!streamerLoading && streamer &&
                 !streamLoading && stream &&
                 !isStreamerBanned &&
                (<Player
                  controls
                  autoplay
                  muted
                  preload="auto"
                  src={stream?.stream_url}
                />)}
                {
                  streamerLoading && (
                    <div className="absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
                      <p className="text-black text-2xl">Loading...</p>
                    </div>
                  )
                }
                {
                  !streamerLoading && !streamer && !isStreamerBanned && (
                    <div className="absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
                      <p className="text-black text-2xl">No user with this name exists</p>
                    </div>
                  )
                }
                {
                  !streamerLoading && streamer && isStreamerBanned && (
                    <div className="absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
                      <p className="text-black text-2xl">This user is currently banned</p>
                    </div>
                  )
                }
                {
                  streamer && !isStreamerBanned &&!streamLoading && !stream &&  (
                    <div className="absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
                      <p className="text-black text-2xl">{streamer?.name} is not currently live</p>
                    </div>
                  )
                }
              </div>
              {(!streamerLoading && streamer && (!isStreamerBanned || isAdmin)) && (<div className="mt-2">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png?w=740&t=st=1691147917~exp=1691148517~hmac=eb6166a62265ce27b7afac68d87a03b748bc37c5361e49e55c8ced8a2f60e2db"
                  className="mt-2 w-7 h-7 rounded-full float-left mr-2"
                  alt="Streamer avatar"
                />
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-xl mb-2">{streamer?.title}</h2>
                  <div className="text-gray-600 text-m pt-2">
                  {!isLoadingUser && user && 
                    !streamerLoading &&
                     ((streamer && !(streamer.id == userId)) || isStreamerBanned) &&
                      isAdmin && (<button
                        className={`text-center ${
                          isStreamerBanned ? "bg-green-800" : "bg-red-800"
                        } text-white font-bold rounded-lg ml-1 px-2 py-1 hover:bg-gray-600`}
                        onClick={handleBan}
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
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                          />
                        </svg>
                        {isStreamerBanned ? "Unban Channel" : "Ban Channel"}
                      </button>)}

                      {!isLoadingUser && user && 
                    !streamerLoading && streamer &&
                    !isStreamerBanned &&
                    ((streamer.id == userId) || isAdmin ) && (
                   <span> 
                    <button
                      className={`text-center ${
                        "bg-blue-800"
                      } text-white font-bold rounded-lg ml-1 px-2 py-1 hover:bg-gray-600`}
                      onClick={openManageModsModal}
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
                          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                        />
                      </svg>
                      Manage Mods
                    </button>
                    <Modal
                      isOpen={modalManageModsIsOpen}
                      onRequestClose={() => setModalManageModsIsOpen(false)}
                      contentLabel="Manage Mods Modal"
                      style={{
                        overlay: {
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                        },
                        content: {
                          maxWidth: "800px",
                          maxHeight: "600px",
                          margin: "auto",
                          padding: "30px",
                        },
                      }}
                    >
                      <Mods streamerId={streamer?.id} streamerName={streamer?.name}
                            onClose={() => {setModalManageModsIsOpen(false)}}/>
                    </Modal>
                    </span>)}


                  {!isLoadingUser && user && 
                    !streamerLoading && streamer &&
                    !isStreamerBanned &&
                    ((streamer.id == userId) || isAdmin || isMod ) && (
                   <span> 
                      
                    <button
                      className={`text-center ${
                        "bg-green-800"
                      } text-white font-bold rounded-lg ml-1 px-2 py-1 hover:bg-gray-600`}
                      onClick={openManageBansModal}
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
                          d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z"
                        />
                      </svg>
                      Manage Bans
                    </button>
                    <Modal
                      isOpen={modalManageBansIsOpen}
                      onRequestClose={() => setModalManageBansIsOpen(false)}
                      contentLabel="Manage Bans Modal"
                      style={{
                        overlay: {
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                        },
                        content: {
                          maxWidth: "800px",
                          maxHeight: "600px",
                          margin: "auto",
                          padding: "30px",
                        },
                      }}
                    >
                      <Bans streamerId={streamer?.id} streamerName={streamer?.name}
                            onClose={() => {setModalManageBansIsOpen(false)}}/>
                    </Modal>
                    </span>)}

                    {!isLoadingUser && user && 
                    !streamerLoading && streamer &&
                    !isStreamerBanned &&
                     !(streamer.id == userId) && (<button
                      className={`ml-1 text-center text-white font-bold rounded-lg px-2 py-1 ${followListLoading ? "bg-gray-600" : isFollowed ? "bg-gray-900" : "bg-gray-800"} hover:bg-gray-600`}
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
                      {followListLoading ? "Loading..." : isFollowed ? "Following" : "Follow"}
                    </button>)}

                    {!streamerLoading && streamer &&
                    !isStreamerBanned && (<button className="text-center ml-1 bg-gray-900 text-white font-bold rounded-lg px-2 py-1 hover:bg-gray-600">
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
                    </button>)}
                    {!isLoadingUser && user && 
                     !streamerLoading && streamer &&
                     !isStreamerBanned &&
                     !(streamer.id == userId) && ( 
                     <button
                      onClick={openDonationModal} // Open the modal on click
                      className="text-center ml-1 mt-1 bg-gray-900 text-white font-bold rounded-lg px-2 py-1 hover:bg-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 inline-block mr-1">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Donate
                    </button>)}

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
                  {stream && (
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
                  </span>)}
                </div>
              </div>)}
            </div>
          </section>
          {!streamerLoading && streamer && !isStreamerBanned && (<Chat streamerId={streamer?.id} />)}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default StreamingRoom