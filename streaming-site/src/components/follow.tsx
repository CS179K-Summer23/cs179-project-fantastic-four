import { useState, useEffect } from "react";
import {
  query,
  where,
  getDocs,
  collection,
  updateDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseApp } from "../utils/firebase.config";

type Follow = {
  followerId: string;
  followingId: string;
};

function Follow({ userId }: { userId: string }) {
  const [isUserFollowing, setIsUserFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { auth, db } = getFirebaseApp();

  useEffect(() => {
    const { auth, db } = getFirebaseApp();

    if (!auth || !db) {
      console.error("Firebase not available");
      return;
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { uid } = user;
        const followingStatus = await doesUserAFollowUserB(uid, userId);
        setIsUserFollowing(followingStatus);
      } else {
        console.log("No user signed in");
      }
    });
  }, [db, auth, userId]);

  const handleFollowButtonClick = async () => {
    if (!auth?.currentUser || loading) return;

    setLoading(true);
    try {
      if (isUserFollowing) {
        await unfollowUser(auth.currentUser.uid, userId);
        setIsUserFollowing(false);
      } else {
        await followUser(auth.currentUser.uid, userId);
        setIsUserFollowing(true);
      }
    } catch (error) {
      console.error("Error while trying to follow/unfollow user:", error);
    } finally {
      setLoading(false);
    }
  };

  const doesUserAFollowUserB = async (userAId: string, userBId: string) => {
    const { db, auth } = getFirebaseApp();

    try {
      const q = query(
        collection(db, "follows"),
        where("followerId", "==", userAId),
        where("followingId", "==", userBId)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking follow status: ", error);
      return false;
    }
  };

  const followUser = async (followerId: string, followingId: string) => {
    const { db, auth } = getFirebaseApp();

    try {
      await addDoc(collection(db, "follows"), {
        followerId,
        followingId,
        followTime: serverTimestamp(),
      });
      console.log("User followed successfully");
    } catch (error) {
      console.error("Error following user: ", error);
    }
  };

  const unfollowUser = async (followerId: string, followingId: string) => {
    const { db, auth } = getFirebaseApp();

    try {
      const q = query(
        collection(db, "follows"),
        where("followerId", "==", followerId),
        where("followingId", "==", followingId)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      console.log("User unfollowed successfully");
    } catch (error) {
      console.error("Error unfollowing user: ", error);
    }
  };

  // useEffect(() => {
  //   if (!userId) return;
  //   const checkFollowStatus = async () => {
  //     if (auth?.currentUser) {
  //       const status = await doesUserAFollowUserB(auth.currentUser.uid, userId);
  //       setIsUserFollowing(status);
  //     }
  //   };

  //   checkFollowStatus();
  // }, [db, auth, userId]);

  return (
    <button
      className="text-center ml-1 bg-gray-900 text-white font-bold rounded-lg px-2 py-1 hover:bg-gray-600"
      disabled={loading}
      onClick={handleFollowButtonClick}
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
      {loading ? "Processing..." : isUserFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}

export default Follow;
