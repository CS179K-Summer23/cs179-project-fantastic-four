import { useState, useEffect, useRef } from 'react'
import { query, doc, where, orderBy, onSnapshot, collection, addDoc, getDoc, getDocs, updateDoc, Timestamp } from 'firebase/firestore'
import { Unsubscribe, onAuthStateChanged } from 'firebase/auth'
import { getFirebaseApp } from '../utils/firebase.config'

type TimestampType = {
  seconds: number
  nanoseconds: number
}

type Message = {
  text: string
  username: string
  timestamp: TimestampType
  streamerId: number
  messageId: string
  userId: number
  deleted: boolean
}

function Chat({ streamerId }: { streamerId: number }) {
  const [user, setUser] = useState<any>(null)
  const [userId, setUserId] = useState<any>(null)
  const [messages, setMessages] = useState<any>([])
  const [chatters, setChatters] = useState<any>({})
  const [isStreamer, setStreamerStatus] = useState(false)
  const [isMod, setModStatus] = useState(false)
  const [isAdmin, setAdminStatus] = useState(false)
  const [isLoadingUser, setLoadingUser] = useState<boolean>(true)
  const [isBannedFromStream, setBannedFromStream] = useState<boolean>(false)
  const unsubIsBannedRef = useRef<Unsubscribe>();


  useEffect(() => {
    const { db, auth } = getFirebaseApp()

    if (!db) return
    if (!streamerId) return
    const unsubChat = onSnapshot(query(collection(db, 'chat'), where('streamerId', '==', streamerId),  where('deleted', '==', false), orderBy('timestamp', 'asc')), async ({ docs }) => {
      if (docs.length === 0) {
        setMessages([])
        return
      }
      let chatters_ = chatters;

      let resultMessages: any = [];

      for (const chatMessage of docs) {
        let userData = chatters_[chatMessage.data().userId]

        if (!userData) {
          const userSnap = await getDoc(doc(db, 'users', '' + chatMessage.data().userId))

          const adminSnap = await getDoc(doc(db, "admins", '' + chatMessage.data().userId))

          const modQuery = query(
            collection(db, "mods"),
            where("modId", "==", chatMessage.data().userId),
            where("streamerId", "==", streamerId)
          )

          const modSnap = await getDocs(modQuery);

          userData = {
            name: userSnap?.data()?.name || 'Anonymous',
            isAdmin: adminSnap.exists(),
            isMod: !modSnap.empty
          } 
          chatters_[chatMessage.data().userId] = userData
        }

        const res =  {
          text: chatMessage.data().text,
          username: userData.name,
          timestamp: chatMessage.data().timestamp,
          streamerId: chatMessage.data().streamerId,
          messageId: chatMessage.id,
          userId: chatMessage.data().userId,
          deleted: chatMessage.data()?.deleted || false,
        } as unknown as Message

        resultMessages.push(res)
      }

      setMessages(resultMessages)
      setChatters(chatters_)
    })

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
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
              unsubIsBannedRef.current = onSnapshot(bannedQuery, async ({docs}) => {
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
        setUserId(null)
        setStreamerStatus(false)
        setModStatus(false)
        setAdminStatus(false)
        setLoadingUser(false)
      }
    })
    return () => {
      unsubAuth();
      unsubIsBannedRef.current && unsubIsBannedRef.current();
      unsubChat();
    }

  }, [streamerId, user, chatters])

  const formatTimestamp = (timestamp: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
    if (!timestamp) return;
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
      timestamp: Timestamp.now(),
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
  }, [db, auth, streamerId, userId])


  return (
    <section
      className="flex w-full sm:w-1/3 flex-col pt-2 md:pt-0"
      style={{ height: "91vh"}}
    >
      <div className="flex rounded shadow-lg min-h-full  h-0 p-2 bg-white flex-col">
        <h2 className="font-bold text-center border-b-2 text-m pb-1">
          STREAM CHAT
        </h2>
        <div className="overflow-auto flex flex-col-reverse">
        <div className="grow p-2 snap-y snap-proximity">
          {messages.map((message: Message, index: number) => (
            (!message.deleted) &&
            <div key={index} className="snap-start pb-2">
              <div className="flex items-center">
                <span className="text-gray-400 text-md pr-2">
                  {message.timestamp && (formatTimestamp(message.timestamp && new Date(message.timestamp.seconds * 1000)))}
                </span>
                <span className="text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis text-sm font-semibold">{message.username}</span>
                {(streamerId == message.userId) && 
                 (<img alt="Streamer" className="pl-2" src="streamer.png"></img>)}
                {!(streamerId == message.userId) && chatters[message.userId]?.isAdmin && 
                 (<img alt="Admin" className="pl-2" src="admin.png"></img>)}
                {!(streamerId == message.userId) && !chatters[message.userId]?.isAdmin && chatters[message.userId]?.isMod && 
                 (<img alt="Mod" className="pl-2" src="mod.png"></img>)}
                {
                  (!(userId === message.userId) && (isStreamer || isAdmin || isMod)) && (
                    <button
                      className="text-red-800 text-xs pl-2 pr-1 ml-auto"
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
                      className={"text-red-500 text-xs" + ((userId === message.userId) ? " ml-auto" : "") }
                      onClick={() => deleteChatMessage(message.messageId)}
                    >
                      Delete
                    </button>
                  )
                }
              </div>
              <p className="break-all">{message.text}</p>
            </div>
          ))}
        </div>
        </div>
        { (!isLoadingUser && user && !isBannedFromStream) && (
          <div className="mt-auto mb-4">
            <form className="flex" onSubmit={async (e) => {
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
      
              // clear input
              messageInput.value = ""
              messageInput.focus()
              
              await addDoc(collection(db, 'chat'), {
                text: message,
                userId,
                timestamp: Timestamp.now(),
                streamerId,
                deleted: false
              })
      
            }}>
            {isStreamer && 
            (<img alt="Streamer" className="absolute mt-3 ml-2 h-5" draggable="false" src="streamer.png"></img>)}
            {!isStreamer && isAdmin && 
            (<img alt="Admin" className="absolute mt-3 ml-2 h-5" draggable="false" src="admin.png"></img>)}
            {!isStreamer && !isAdmin && isMod && 
            (<img alt="Mod" className="absolute mt-3 ml-2 h-5" draggable="false" src="mod.png"></img>)}
            <input
              className="w-full rounded-l-lg pl-8 p-2 border-2 border-gray-900"
              type="text"
              autoComplete='off'
              id="text"
              placeholder="Write a message..."
            />
            <button
              type="submit"
              className="px-2 bg-gray-900 text-white font-semibold hover:text-white border hover:bg-gray-600 border-gray-900 hover:border-transparent rounded-r-lg"
            >
              Send
            </button>
            </form>
          </div>
        )}
        { (!isLoadingUser && user && isBannedFromStream) && (
            <input
            className="w-full mt-auto mb-4 text-center rounded-lg p-2 border-2 border-red-700"
            type="text"
            id="text"
            disabled
            placeholder="Banned from Chat"
          />

        )}
        { (!isLoadingUser && !userId) && (
            <input
            className="w-full mt-auto my-4 text-center rounded-lg p-2 border-2 border-black"
            type="text"
            id="text"
            disabled
            placeholder="Login or Signup to Chat"
          />
        )} 
        
    </div>
    </section>
  )
}

export default Chat