import { useState, useEffect, useRef } from 'react'
import { query, doc, where, orderBy, onSnapshot, collection, addDoc, getDoc, serverTimestamp, deleteDoc, getDocs, QuerySnapshot, updateDoc } from 'firebase/firestore'
import { Unsubscribe, onAuthStateChanged } from 'firebase/auth'
import { getFirebaseApp } from '../utils/firebase.config'
import { setUserId } from 'firebase/analytics'

type Timestamp = {
  seconds: number
  nanoseconds: number
}

type Message = {
  text: string
  username: string
  timestamp: Timestamp
  streamerId: number
  messageId: string
  userId: number
  deleted: boolean
}

function Chat({ streamerId }: { streamerId: number }) {
  const [user, setUser] = useState<any>(null)
  const [userId, setUserId] = useState<any>(null)
  const [messages, setMessages] = useState<any>([])
  const [isStreamer, setStreamerStatus] = useState(false)
  const [isMod, setModStatus] = useState(false)
  const [isAdmin, setAdminStatus] = useState(false)
  const [isLoadingUser, setLoadingUser] = useState<boolean>(true)
  const [isBannedFromStream, setBannedFromStream] = useState<boolean>(false)
  const isBannedSnapshotRef = useRef<Unsubscribe>();


  useEffect(() => {
    const { db, auth } = getFirebaseApp()

    if (!db) return
    if (!streamerId) return
    const unsubscribe = onSnapshot(query(collection(db, 'chat'), where('streamerId', '==', streamerId),  where('deleted', '==', false), orderBy('timestamp', 'asc')), async ({ docs }) => {
      if (docs.length === 0) {
        setMessages([])
        return
      }

      setMessages(await Promise.all(docs.map(async (chatMessage) => {
        // need to cache users to reduce db requests if they have multiple messages
        // userId -> username
        const userSnap = await getDoc(doc(db, 'users', '' + chatMessage.data().userId))

        return {
          text: chatMessage.data().text,
          username: userSnap?.data()?.name || 'Anonymous',
          timestamp: chatMessage.data().timestamp,
          streamerId: chatMessage.data().streamerId,
          messageId: chatMessage.id,
          userId: chatMessage.data().userId,
          deleted: chatMessage.data()?.deleted || false,
        } as unknown as Message
      })))
    })

    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        await getDoc(doc(db, 'accounts', firebaseUser.uid))
          .then(async (data) => {
            if (data.exists()) {
              const userId = data.data()['id']
              setUserId(userId) 
              setStreamerStatus(userId === streamerId)

              // Check if User is banned from stream
              const bannedQuery = query(
                collection(db, "bans"),
                where("userId", "==", userId),
                where("streamerId", "==", streamerId)
              )

              isBannedSnapshotRef.current = onSnapshot(bannedQuery, async ({docs}) => {
                if (docs.length === 0) {setBannedFromStream(false);}
                else {setBannedFromStream(true);}
                return
              })
              
              // Check if User is Admin
              getDoc(doc(db, "admins", '' + userId)).then((data) => { 
                if (data.exists()) setAdminStatus(true);
              })

              // Check if User is Mod in this Stream
              const modQuery = query(
                collection(db, "mods"),
                where("modId", "==", userId),
                where("streamerId", "==", streamerId)
              )

              const modSnap = await getDocs(modQuery);

              if(!modSnap.empty) setModStatus(true);
              
              setLoadingUser(false)
            }
            else setLoadingUser(false)

        })
      } else {
        setUser(null)
        setLoadingUser(false)
      }
    })
    return () => {
      isBannedSnapshotRef.current && isBannedSnapshotRef.current();
      unsubscribe();
    }

  }, [streamerId, user])

  const formatTimestamp = (timestamp: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
    return new Intl.DateTimeFormat("en-US", options).format(timestamp)
  }

  const deleteChatMessage = async (messageId: string) => {
    const { db, auth } = getFirebaseApp()

    if (!db) {
      console.error('Firebase error: Firestore not available')
      return
    }

    if (!auth) {
      console.error('Firebase error: Auth not available')
      return
    }

    if (auth.currentUser === null) {
      alert('Not logged in')
      return
    }

    const isOriginalCommenter = messages.find((message: Message) => message.messageId === messageId)?.userId === userId

    if (!(isOriginalCommenter || isStreamer || isMod || isAdmin)) {
      alert('Not authorized to delete this message')
      return
    }
    
    try {
      await updateDoc(doc(db, 'chat', messageId), {
        deleted: true
      })
    } catch {
      alert('Error deleting message')
    }
  }

  const banMessageAuthor = async (authorId: number) => {
    const { db, auth } = getFirebaseApp()

    if (!db) {
      console.error('Firebase error: Firestore not available')
      return
    }

    if (!auth) {
      console.error('Firebase error: Auth not available')
      return
    }

    if (auth.currentUser === null) {
      alert('Not logged in')
      return
    }

    // Ban user
    await addDoc(collection(db, "bans"), {
      streamerId,
      userId: authorId,
      timestamp: serverTimestamp(),
      bannedById: userId
    })
    
    // Delete messages from banned user in this chat
    messages.forEach(async (message: Message, i: number) => {
      if (!(message.userId === authorId)) return
      await updateDoc(doc(db, 'chat', messages[i].messageId), {
        deleted: true
      })
    });
  }

  const { db, auth } = getFirebaseApp()

  useEffect(() => {
    (async function () {
      if (!db || !auth || !auth.currentUser) return

      if (userId === streamerId) {
        setStreamerStatus(true)
      }
    }())
  }, [db, auth, streamerId])


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
            (!message.deleted) &&
            <div key={index} className="mb-2">
              <div className="flex items-center">
                <span className="text-gray-400 text-xs pr-2">
                  {formatTimestamp(message.timestamp && new Date(message.timestamp.seconds * 1000))}
                </span>
                <span className="text-gray-600 text-sm mr-auto font-semibold">{message.username}</span>
                {
                  (isStreamer || isAdmin || isMod) && (
                    <button
                      className="text-red-800 text-xs pr-1"
                      onClick={() => banMessageAuthor(message.userId)}
                    >
                      Ban
                    </button>
                  )
                }
                {
                  /* only show delete button if user is streamer, admin, mod, or original commenter */
                  ((userId === message.userId) || isStreamer || isAdmin || isMod) && (
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

        { (!isLoadingUser && user && !isBannedFromStream) && (
          <div>
            <form className="my-4 flex bg-white m" onSubmit={async (e) => {
              e.preventDefault()
      
              if (!db) {
                alert('Error submitting message')
                return
              }
      
              if (!user) {
                alert('Please sign in to chat')
                return
              }
      
              const messageInput = document.getElementById('text') as HTMLInputElement
              const message = messageInput.value.trim()
      
              if (message === "") return
      
              await addDoc(collection(db, 'chat'), {
                text: message,
                userId,
                timestamp: serverTimestamp(),
                streamerId,
                deleted: false
              })
      
              // clear input
              messageInput.value = ""
              messageInput.focus()
            }}>
              <input
              className="w-full rounded-l-lg p-2 border-2 border-gray-900"
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
          </div>
        )}
        { (!isLoadingUser && user && isBannedFromStream) && (
            <input
            className="w-full my-4 text-center rounded-lg p-2 border-2 border-red-700"
            type="text"
            id="text"
            disabled
            placeholder="Banned from Chat"
          />

        )}
        { (!isLoadingUser && !userId) && (
            <input
            className="w-full my-4 text-center rounded-lg p-2 border-2 border-black"
            type="text"
            id="text"
            disabled
            placeholder="Login or Signup to Chat"
          />
        )}
    </section>
  )
}

export default Chat
