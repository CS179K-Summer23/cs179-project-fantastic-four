import { useState, useEffect } from 'react'
import { query, doc, where, orderBy, onSnapshot, collection, getDoc, deleteDoc, serverTimestamp, getDocs, addDoc, Timestamp } from 'firebase/firestore'
import { Unsubscribe } from 'firebase/auth'
import { getFirebaseApp } from '../utils/firebase.config'

type TimestampType = {
    seconds: number
    nanoseconds: number
}

type ModEntry = {
    modId: string,
    streamerId: number,
    modUserId: number,
    modUserName: string,
    timestamp: TimestampType
}

function Mods({ streamerId, streamerName, onClose }: { streamerId: number, streamerName: string, onClose: any }) {
    const [mods, setMods] = useState<any>(null);
    const [loadingMods, setLoadingMods] = useState<boolean>(true);
    
    useEffect(() => {

        const { db, auth } = getFirebaseApp()

        if (!db) return
        if (!streamerId || !streamerName) return

        const modsQuery = query(
            collection(db, 'mods'),
            where('streamerId', "==", streamerId),
            orderBy('timestamp', 'desc')
        )
            
        const unsubMods: Unsubscribe = onSnapshot(modsQuery, async ({docs}) => {
            if (!docs.length) {
                setMods([])
                setLoadingMods(false)
                return
            }

            setMods(await Promise.all(docs.map(async (modDoc) => {
                if (!modDoc.exists()) return;
                const modData: ModEntry = modDoc.data() as any

                const modUserSnap = await getDoc(doc(db, 'users', '' + modData.modId))

                if(!modUserSnap.exists()) return;

                const modUserData = modUserSnap.data()

                return {
                    ...modData, 
                    modId: modDoc.id,
                    modUserName: modUserData['name']
                } as ModEntry
            })))
            
            setLoadingMods(false)
        })
        return () => {
            unsubMods()
        }
    
    }, [streamerId, streamerName])

    const formatTimestamp = (timestamp: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'numeric',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }
        return new Intl.DateTimeFormat('en-US', options).format(timestamp)
      }

    const unModUser = async (modId: string) => {
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

        await deleteDoc(doc(db, 'mods', modId))

    }
    const { db, auth } = getFirebaseApp()

return (
    <div>
        <button
            onClick={() => onClose()}
            className="float-right cursor-pointer"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-8 h-8 inline-block mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <h2 className="font-bold text-2xl text-center border-b-2 text-m pb-2">
          Manage {streamerName}&apos;s Mods 
        </h2>
        <div className="sticky ml-2">

            <form className="my-4 flex bg-white m" onSubmit={async (e) => {
              e.preventDefault()
      
              if (!db) {
                console.error('no db')
                return
              }
      
      
              const modNameInput = document.getElementById('modInput') as HTMLInputElement
              const errorBox = document.getElementById('errorBox') as any
            //   errorBox.textContent = ""
              const modName = modNameInput.value.trim()
      
              // Check if user already mod
              if(mods.some((mod: ModEntry) => mod.modUserName === modName)) {
                errorBox.textContent = "This User is already Mod"
                return
              }

              // 
              if(modName == streamerName) {
                errorBox.textContent = "You don't need to mod yourself."
                return
              }

              if (modName === "") {
                return
              }
      
              const userQuery = query(
                collection(db, "users"), 
                where("name", "==", modName)
              );        

              const userSnap = await getDocs(userQuery)

              // Invalid Username
              if(userSnap.empty) {
                errorBox.textContent = "No User Exists with this Username"
                return 
              }

              const userData = userSnap.docs[0].data();

              await addDoc(collection(db, 'mods'), {
                  streamerId,
                  modId: userData['id'],
                  timestamp: Timestamp.now(),
              })

              // clear input
              modNameInput.value = ""
              modNameInput.focus()

              errorBox.textContent = ""
      
             }}>
                <input
                className="rounded-l-lg pl-2 p-2 border-2 border-gray-900"
                type="text"
                id="modInput"
                placeholder="Enter Exact Username"
                />
                <button
                type="submit"
                className="py-2 px-2 bg-gray-900 text-white font-semibold hover:text-white border hover:bg-gray-600 border-gray-900 hover:border-transparent rounded-r-lg"
                >
                Add Mod
                </button>
                <div
                    id="errorBox" 
                    className='p-2 text-red-500 text-lg text-center font-semibold'>
                </div>  
            </form>
        </div>
        <div className="p-2 overflow-y-auto">
            <table width="100%">
                    <tr>
                        <th className="float-left">Mod Username</th>
                        <th>Mod Since</th>
                        <th className="float-right">Action</th>
                    </tr>
                {!loadingMods && (mods.map((mod: ModEntry, i: number) => (

                    <tr key={i}>
                        <td>{mod.modUserName}</td>
                        <td className="text-center">{formatTimestamp(new Date(mod.timestamp.seconds * 1000))}</td>
                        <td className="float-right">
                            <button
                            className="hover:bg-red-300 rounded-md p-1 mt-1 bg-red-100"
                            onClick={() => unModUser(mod.modId)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5 inline-block mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" 
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                </svg>
                            </button>
                        </td>
                    </tr>
                )))}
                {(loadingMods || !mods?.length) && (
                <div className="pointer-events-none absolute top-0 left-0 w-full h-full flex justify-center items-center">
                    <p className="text-black text-2xl rounded-md bg-gray-400 bg-opacity-50 p-6">
                        {loadingMods ? ("Loading...") : ("No Mods.")}
                    </p>
                </div>
                )}
            </table>
        </div>
    </div>
)}

export default Mods