import React, { useState, useEffect } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  Firestore,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseApp } from "../utils/firebase.config";
import { signOut } from "firebase/auth";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For side menu
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // For settings drop-down
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isInputFocused, setInputFocused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSearch = async (
    db: Firestore,
    searchTerm: string,
    setSearchResults: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    if (!db) {
      console.error("Firebase error: Database not available");
      return;
    }

    const searchInCollection = async (colName: string, fields: string[]) => {
      const collectionRef = collection(db, colName);
      const snapshot = await getDocs(collectionRef);
      return snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...fields.reduce((acc: any, field: string) => {
              acc[field] = data[field];
              return acc;
            }, {}),
          };
        })
        .filter((doc: any) =>
          fields.some((field) =>
            doc[field]
              ? doc[field].toLowerCase().includes(searchTerm.toLowerCase())
              : false
          )
        );
    };

    const accountResults = await searchInCollection("accounts", [
      "name",
      "title",
      "category",
    ]);

    const combinedResults = [
      ...accountResults.map((r) => ({ ...r, type: "Account" })),
    ];

    // Deduplicate categories
    const uniqueCategories: any[] = [];
    accountResults.forEach((result: any) => {
      if (
        result.category &&
        !uniqueCategories.find((cat) => cat.name === result.category)
      ) {
        uniqueCategories.push({
          id: uniqueCategories.length + 1,
          name: result.category,
          type: "Category",
        });
      }
    });

    setSearchResults([...combinedResults, ...uniqueCategories]);
  };

  useEffect(() => {
    const { auth, db } = getFirebaseApp();

    if (!auth || !db) {
      console.error("Firebase error: Firebase not available");
      return;
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid } = user;
        const docRef = doc(db, "accounts", uid);

        getDoc(docRef).then((userData) => {
          if (!userData.exists()) {
            console.error("Firebase Error: User does not exist in firestore");
            return;
          }

          setUser(userData.data());
        });
      }
    });

    handleSearch(db, searchTerm, setSearchResults);
  }, [searchTerm]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <nav className="flex items-center justify-between bg-gray-900 flex-wrap px-6 py-1">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Link href="/" className="font-semibold text-xl tracking-tight">
          Fantastic Four
        </Link>
      </div>
      <div className="block lg:hidden pb-2">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white"
        >
          <svg
            className={`fill-current h-3 w-3 ${
              isMenuOpen ? "hidden" : "block"
            }`}
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      <div
        className={`w-full block flex-grow lg:flex lg:items-center lg:w-auto ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="text-sm lg:flex-grow">
          <Link
            href="/"
            className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
          >
            Home
          </Link>
          <Link
            href="/streams"
            className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
          >
            Streams
          </Link>

          {/* <Link
            href="/categories"
            className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4"
          >
            Videos
          </Link> */}
        </div>

        <div className="relative">
          <form className="text-sm mr-20 flex pb-2">
            <input
              className="bg-grey-lighter rounded py-2 mt-4 mb-2 px-4 w-full"
              type="search"
              placeholder="Search"
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
            <Link href={`/search?term=${searchTerm}`}>
              <button
                type="submit"
                className="p-2 ml-1 mt-4 mb-2 text-sm font-medium text-white rounded border border-white-700 hover:text-teal-500 hover:bg-white  dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <svg
                  className="w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </button>
            </Link>
          </form>
          {searchTerm && isInputFocused && (
            <div className="absolute top-full left-0 w-full bg-white rounded z-10 shadow-lg">
              {searchResults.slice(0, 8).map((result, index) => (
                <Link href={`/search?term=${searchTerm}`} key={index}>
                  <div className="p-3 border-b last:border-b-0 hover:bg-gray-100 rounded">
                    {result.name || result.title || result.description}
                  </div>
                </Link>
              ))}
              {searchResults.length > 8 && (
                <Link href={`/search?term=${searchTerm}`}>
                  <div className="p-3 text-gray-700 hover:bg-gray-100 rounded">
                    See more results...
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center">
          {user && (
            <>
              <div className="relative inline-block text-left">
                <Link
                  href="/following"
                  className="inline-block text-sm ml-2 mr-2 leading-none rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white lg:mt-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    type="button"
                    className="w-8 h-8 inline-block"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                </Link>
              </div>

              <div className="relative inline-block text-left">
                <button
                  className="flex items-center justify-center text-sm px-2 py-1 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white lg:mt-0"
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="w-8 h-8 inline-block mr-1"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {user?.name}
                </button>
                {isSettingsOpen && (
                  <div className="absolute right-0 z-10 mt-1 w-28 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Link
                        href="/settings"
                        className="text-gray-700 block px-4 py-2 text-sm"
                      >
                        Settings
                      </Link>

                      <button
                        className="text-gray-700 block px-4 py-2 text-sm"
                        onClick={async () => {
                          const { auth } = getFirebaseApp();
                          if (!auth) {
                            console.error("Firebase error: auth not available");
                            return;
                          }

                          try {
                            await signOut(auth);
                            location.href = "/";
                          } catch (e) {
                            alert("Error signing out");
                            return;
                          }
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {!user && (
            <>
              <Link
                href="/signin"
                className="inline-block items-center text-sm p-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white lg:mt-0"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="inline-block text-sm ml-2 px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white lg:mt-0"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
