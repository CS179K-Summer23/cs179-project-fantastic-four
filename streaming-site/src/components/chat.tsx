import { useState, useEffect } from 'react'
import { query, doc, where, onSnapshot, collection, addDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseApp } from '../utils/firebase.config'

type Message = {
  text: string
  username: string
  timestamp: Date
  streamId: string
  messageId: string
  userId: string
}

function Chat({ streamId }: { streamId: string }) {
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any>([])

  useEffect(() => {
    const { db, auth } = getFirebaseApp()

    if (!db) return
    if (!streamId) return

    const unsubscribe = onSnapshot(query(collection(db, 'chat'), where('streamId', '==', streamId)), async ({ docs }) => {
      if (docs.length === 0) {
        setMessages([])
        return
      }

      setMessages(await Promise.all(docs.map(async (chatMessage) => {
        const userSnap = await getDoc(doc(db, 'users', chatMessage.data().userId))

        return {
          text: chatMessage.data().text,
          username: userSnap?.data()?.name || 'Anonymous',
          timestamp: chatMessage.data().timestamp,
          streamId: chatMessage.data().streamId,
          messageId: chatMessage.id,
          userId: chatMessage.data().userId,
        } as unknown as Message
      })))
    })

    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
      } else {
        setUser(null)
      }
    })
    return () => unsubscribe()
  }, [streamId, user])

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

    const userId = auth.currentUser.uid
    const isOriginalCommenter = messages.find((message: Message) => message.messageId === messageId)?.userId === userId
    const isStreamer = (await getDoc(doc(db, 'users', userId))).data()?.id === (await getDoc(doc(db, 'streams', streamId))).data()?.streamer_id

    if (!isOriginalCommenter && !!isStreamer) {
      alert('Not authorized to delete this message')
      return
    }

    try {
      await deleteDoc(doc(db, 'chat', messageId))
    } catch {
      alert('Error deleting message')
    }
  }

  const { db } = getFirebaseApp()
  const isStreamer = getDoc(doc(db, 'streams', streamId)).then((stream) => {
    if (!user) return false
    return stream.data()?.streamer_id === user.uid
  })

  return (
    <section
      className="flex flex-col justify-between w-full md:w-1/3 mt-4 pt-2 px-2 bg-white shadow-lg"
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
                <span className="text-gray-600 text-sm">{message.username}</span>
                <span className="text-gray-400 text-xs">
                  {formatTimestamp(message.timestamp)}
                </span>
                {
                  /* only show delete button if user is streamer or original commenter */
                  (user?.uid === message.userId) && 
                  (
                    <span className="cursor-pointer" onClick={() => deleteChatMessage(message.messageId)}>
                      X
                    </span>
                  )
                }
              </div>
              <p>{message.text}</p>
            </div>
          ))}
        </div>
      </div>

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
          userId: user.uid,
          timestamp: serverTimestamp(),
          streamId,
        })

        // clear input
        messageInput.value = ""
        messageInput.focus()
      }}>
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
  )
}

export default Chat
