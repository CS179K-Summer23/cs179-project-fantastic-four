import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { getFirebaseApp } from "../../utils/firebase.config";
import {
  Firestore,
  getDocs,
  collection,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";

type SearchResult = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  view_count?: number;
  profilePictureUrl?: string;
  type: "Account" | "Stream" | "Category";
};

function Searchpage(): JSX.Element {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showAllStreams, setShowAllStreams] = useState(false);
  const searchTerm = router.query.term as string;

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
      const snapshot = await getDocs(collectionRef); // No source option
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

    handleSearch(db, searchTerm, setSearchResults);
  }, [searchTerm]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto p-8">
          <h1 className="text-2xl font-semibold mb-4">
            Search Results for{" "}
            <span className="text-blue-500">"{searchTerm}"</span>
          </h1>

          {searchResults.length === 0 ? (
            <div className="text-center text-gray-600">
              <p className="mb-4 font-bold">No results found.</p>
              <p className="text-sm font-bold">
                Try searching with different keywords.
              </p>
            </div>
          ) : (
            <div>
              {["Account", "Stream", "Category"].map((type) => {
                const filteredResults = searchResults.filter(
                  (result) => result.type === type
                );
                if (filteredResults.length === 0) return null;

                const limitedResults = showAllStreams
                  ? filteredResults
                  : filteredResults.slice(0, 8);

                const displayType = {
                  Account: "Related Users",
                  Stream: "Related Streams",
                  Category: "Related Categories",
                }[type];

                return (
                  <section key={type}>
                    <h2 className="text-2xl font-bold my-4">{displayType}</h2>
                    {type === "Account" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {limitedResults.map((account) => (
                          <div key={account.id}>
                            <Link
                              href={`/${account.name}`}
                              className="hover:text-gray-500"
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
                              {account.name}
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : type === "Stream" ? (
                      <div className="flex flex-wrap">
                        {limitedResults.map((stream) => (
                          <div
                            key={stream.id}
                            className="m-4 p-4 rounded bg-white shadow-lg"
                          >
                            <Link
                              href={`/${stream.title}`}
                              className="text-blue-500 hover:underline"
                            >
                              {stream.title}
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                        {limitedResults.map((category) => (
                          <div key={category.id}>
                            <Link href={"/categories/" + category.name}>
                              <div className="rounded overflow-hidden shadow-lg p-4 bg-white hover:bg-gray-500 hover:text-white cursor-pointer">
                                {category.name}
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Searchpage;
