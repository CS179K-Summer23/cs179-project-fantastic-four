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
import { setUserId } from "firebase/analytics";

type Timestamp = {
  seconds: number;
  nanoseconds: number;
};

type Message = {
  text: string;
  username: string;
  timestamp: Timestamp;
  streamerId: number;
  messageId: string;
  userId: number;
};

function Chat({ streamerId }: { streamerId: number }) {
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<any>(null);
  const [messages, setMessages] = useState<any>([]);
  const [isStreamer, setStreamerStatus] = useState(false);

  useEffect(() => {
    const { db, auth } = getFirebaseApp();

    if (!db) return;
    if (!streamerId) return;
    const unsubscribe = onSnapshot(
      query(
        collection(db, "chat"),
        where("streamerId", "==", streamerId),
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
                doc(db, "users", "" + chatMessage.data().userId)
              );
              return {
                text: chatMessage.data().text,
                username: userSnap?.data()?.name || "Anonymous",
                timestamp: chatMessage.data().timestamp,
                streamerId: chatMessage.data().streamerId,
                messageId: chatMessage.id,
                userId: chatMessage.data().userId,
              } as unknown as Message;
            })
          )
        );
      }
    );

    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await getDoc(doc(db, "accounts", firebaseUser.uid)).then((data) => {
          if (data.exists()) {
            const userId = data.data()["id"];
            setUserId(userId);
            setStreamerStatus(userId === streamerId);
          }
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [streamerId, user]);

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

    const isOriginalCommenter =
      messages.find((message: Message) => message.messageId === messageId)
        ?.userId === userId;
    const isStreamer = userId === streamerId;

    if (!(isOriginalCommenter || isStreamer)) {
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

  useEffect(() => {
    (async function () {
      if (!db || !auth || !auth.currentUser) return;

      if (userId === streamerId) {
        setStreamerStatus(true);
      }
    })();
  }, [db, auth, streamerId]);

  return (
    <section
      className="flex flex-col justify-between w-full h-full overflow-scroll md:w-1/3 mt-4 pt-2 px-2 bg-white shadow-lg"
      style={{ maxWidth: "350px" }}
    >
      <div className="bg-white">
        <h2 className="font-bold text-center border-b-2 text-m pb-1">
          STREAM CHAT
        </h2>
        <div className="chat-container p-2 m-0 overflow-y-auto">
          {messages.map((message: Message, index: number) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">
                  {message.username}
                </span>
                <span className="text-gray-400 text-xs">
                  {formatTimestamp(
                    message.timestamp &&
                      new Date(message.timestamp.seconds * 1000)
                  )}
                </span>
                {
                  /* only show delete button if user is streamer or original commenter */
                  (userId === message.userId || isStreamer) && (
                    <button
                      className="text-red-500 text-xs"
                      onClick={() => deleteChatMessage(message.messageId)}
                    >
                      Delete
                    </button>
                  )
                }
              </div>
              <p>{message.text}</p>
            </div>
          ))}
        </div>
      </div>

      <form
        className="my-4 flex bg-white m"
        onSubmit={async (e) => {
          e.preventDefault();

          if (!db) {
            alert("Error submitting message");
            return;
          }

          if (!user) {
            alert("Please sign in to chat");
            return;
          }

          const messageInput = document.getElementById(
            "text"
          ) as HTMLInputElement;
          const message = messageInput.value.trim();

          if (message === "") return;

          await addDoc(collection(db, "chat"), {
            text: message,
            userId,
            timestamp: serverTimestamp(),
            streamerId,
          });

          // clear input
          messageInput.value = "";
          messageInput.focus();
        }}
      >
        <input
          className="w-full rounded-l-lg p-2 border border-gray-900"
          type="text"
          id="text"
          placeholder="Write a message..."
        />
        <button
          type="submit"
          className="py-2 px-2 bg-gray-900 text-white font-semibold hover:text-white border hover:bg-gray-600 border-gray-900 hover:border-transparent rounded-r-lg"
        >
          Send
        </button>
      </form>
    </section>
  );
}

export default Chat;
