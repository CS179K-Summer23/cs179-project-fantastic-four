import { useState, useEffect } from 'react'
import { query, doc, where, orderBy, onSnapshot, collection, getDoc, deleteDoc } from 'firebase/firestore'
import { Unsubscribe } from 'firebase/auth'
import { getFirebaseApp } from '../utils/firebase.config'

type Timestamp = {
    seconds: number
    nanoseconds: number
}

type BanEntry = {
    banId: string,
    bannedByName: string,
    bannedById: number,
    streamerId: number,
    userId: number,
    userName: string,
    timestamp: Timestamp
}

function Bans({ streamerId, streamerName, onClose }: { streamerId: number, streamerName: string, onClose: any }) {
    const [bans, setBans] = useState<any>(null);
    const [loadingBans, setLoadingBans] = useState<boolean>(true);

    useEffect(() => {

        const { db, auth } = getFirebaseApp()

        if (!db) return
        if (!streamerId || !streamerName) return

        const bansQuery = query(
            collection(db, 'bans'),
            where('streamerId', "==", streamerId),
            orderBy('timestamp', 'desc')
        )
            
        const unsubBans: Unsubscribe = onSnapshot(bansQuery, async ({docs}) => {
            if (!docs.length) {
                setBans([])
                setLoadingBans(false)
                return
            }

            setBans(await Promise.all(docs.map(async (banDoc) => {
                if (!banDoc.exists()) return;
                const banData: BanEntry = banDoc.data() as any

                const bannedBySnap = await getDoc(doc(db, 'users', '' + banData.bannedById))
                const bannedUserSnap = await getDoc(doc(db, 'users', '' + banData.userId))

                if(!bannedBySnap.exists()) return;
                if(!bannedUserSnap.exists()) return;

                const bannedByData = bannedBySnap.data()
                const bannedUserData = bannedUserSnap.data()

                return {
                    ...banData, 
                    banId: banDoc.id,
                    bannedByName: bannedByData['name'],
                    userName: bannedUserData['name']
                } as BanEntry
            })))
            
            setLoadingBans(false)
        })
        return () => {
            unsubBans()
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

    const unBanUser = async (banId: string) => {
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

        await deleteDoc(doc(db, 'bans', banId))

    }

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
          Manage {streamerName}&apos;s Banned Users 
        </h2>
        <div className="p-2 overflow-y-auto">
            <table width="100%">
                    <tr>
                        <th className="float-left">Banned User</th>
                        <th>Banned By</th>
                        <th>Banned Since</th>
                        <th className="float-right">Action</th>
                    </tr>
                {!loadingBans && (bans.map((ban: BanEntry, i: number) => (

                    <tr key={i}>
                        <td>{ban.userName}</td>
                        <td>{ban.bannedByName}</td>
                        <td className="text-center">{formatTimestamp(new Date(ban.timestamp.seconds * 1000))}</td>
                        <td className="float-right">
                            <button
                            className="hover:bg-green-300 rounded-md p-1 mt-1 bg-green-100"
                            onClick={() => unBanUser(ban.banId)}
                            >
                            Unban
                            </button>
                        </td>
                    </tr>
                )))}
                {(loadingBans || !bans?.length) && (
                <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
                    <p className="text-black text-2xl rounded-md bg-gray-400 bg-opacity-50 p-6">
                        {loadingBans ? ("Loading...") : ("No Banned Users.")}
                    </p>
                </div>
                )}
            </table>
        </div>
    </div>
)}

export default Bans