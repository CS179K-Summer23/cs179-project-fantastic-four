import { useState, useEffect } from "react";
import {
  query,
  doc,
  where,
  orderBy,
  onSnapshot,
  collection,
  addDoc,
  getDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseApp } from "../utils/firebase.config";

type Timestamp = {
  seconds: number;
  nanoseconds: number;
};

type Message = {
  text: string;
  username: string;
  timestamp: Timestamp;
  streamId: string;
  messageId: string;
  userId: string;
};

function Chat({ streamId }: { streamId: string }) {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any>([]);

  useEffect(() => {
    const { db, auth } = getFirebaseApp();

    if (!db) return;
    if (!streamId) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, "chat"),
        where("streamId", "==", streamId),
        orderBy("timestamp", "asc")
      ),
      async ({ docs }) => {
        if (docs.length === 0) {
          setMessages([]);
          return;
        }

        setMessages(
          await Promise.all(
            docs.map(async (chatMessage) => {
              const userSnap = await getDoc(
                doc(db, "users", chatMessage.data().userId)
              );

              return {
                text: chatMessage.data().text,
                username: userSnap?.data()?.name || "Anonymous",
                timestamp: chatMessage.data().timestamp,
                streamId: chatMessage.data().streamId,
                messageId: chatMessage.id,
                userId: chatMessage.data().userId,
              } as unknown as Message;
            })
          )
        );
      }
    );

    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [streamId, user]);

  const formatTimestamp = (timestamp: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-US", options).format(timestamp);
  };

  const deleteChatMessage = async (messageId: string) => {
    const { db, auth } = getFirebaseApp();

    if (!db) {
      console.error("Firebase error: Firestore not available");
      return;
    }

    if (!auth) {
      console.error("Firebase error: Auth not available");
      return;
    }

    if (auth.currentUser === null) {
      alert("Not logged in");
      return;
    }

    const userId = auth.currentUser.uid;
    const isOriginalCommenter =
      messages.find((message: Message) => message.messageId === messageId)
        ?.userId === userId;
    const isStreamer =
      (await getDoc(doc(db, "users", userId))).data()?.id ===
      (await getDoc(doc(db, "streams", streamId))).data()?.streamer_id;

    console.log("isOriginalCommenter", isOriginalCommenter);
    console.log("isStreamer", isStreamer);

    if (!isOriginalCommenter || !!isStreamer) {
      alert("Not authorized to delete this message");
      return;
    }

    try {
      await deleteDoc(doc(db, "chat", messageId));
    } catch {
      alert("Error deleting message");
    }
  };

  const { db, auth } = getFirebaseApp();
  const [isStreamer, setStreamerStatus] = useState(false);

  useEffect(() => {
    (async function () {
      if (!db || !auth || !auth.currentUser) return;

      if (
        (await getDoc(doc(db, "users", auth.currentUser?.uid))).data()?.id ===
        (await getDoc(doc(db, "streams", streamId))).data()?.streamer_id
      ) {
        setStreamerStatus(true);
      }
    })();
  }, [db, auth, streamId]);

  // console.log('isStreamer', isStreamer)
}

export default Chat;
