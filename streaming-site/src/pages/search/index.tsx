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
            doc[field]?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
    };

    const accountResults = await searchInCollection("accounts", ["name"]);
    const streamResults = await searchInCollection("streams", [
      "title",
      "category",
    ]);

    const combinedResults = [
      ...accountResults.map((r) => ({ ...r, type: "Account" })),
      ...streamResults.map((r) => ({ ...r, type: "Stream" })),
    ];

    // Deduplicate categories
    const uniqueCategories: any[] = [];
    streamResults.forEach((result: any) => {
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
            <span className="text-blue-500">&quot;{searchTerm}&quot;</span>
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

                // Limit results to 8 if `showAllStreams` is false
                const limitedResults = showAllStreams
                  ? filteredResults
                  : filteredResults.slice(0, 8);

                // Mapping to user-friendly names
                const displayType =
                  type === "Account"
                    ? "Related Users"
                    : type === "Stream"
                    ? "Related Streams"
                    : "Related Categories";

                return (
                  <section key={type}>
                    <h2 className="text-2xl font-bold my-4">{displayType}</h2>

                    {type === "Account" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {limitedResults.map((account) => (
                          <div
                            key={account.id}
                            // className="rounded overflow-hidden shadow-lg p-4 bg-white text-center"
                          >
                            <span className="text-sm">
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
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : type === "Category" ? (
                      <div className="flex flex-wrap">
                        {limitedResults.map((category) => (
                          <div key={category.id} className="m-4">
                            <span className="ml-2 text-lg font-semibold">
                              {category.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {limitedResults.map((result) => (
                          <div
                            key={result.id}
                            className="rounded overflow-hidden shadow-lg p-4 bg-white"
                          >
                            <div className="mt-2">
                              <Link
                                href={`/${result.id}`}
                                className="text-blue-500 hover:underline"
                              >
                                {result.name ||
                                  result.title ||
                                  result.description}
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredResults.length > 8 && (
                      <div className="mt-4 flex items-center justify-center">
                        <div className="flex-grow h-px bg-gray-300"></div>
                        <button
                          onClick={() => setShowAllStreams(!showAllStreams)}
                          className="font-bold text-sm text-black mx-4 p-1 hover:text-white hover:bg-gray-800 hover:rounded-lg"
                        >
                          {showAllStreams
                            ? "Show less"
                            : `Show all ${displayType}`}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            className="w-6 h-6 inline-block ml-1"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={
                                showAllStreams
                                  ? "M4.5 15.75l7.5-7.5 7.5 7.5"
                                  : "M19.5 8.25l-7.5 7.5-7.5-7.5"
                              }
                            />
                          </svg>
                        </button>
                        <div className="flex-grow h-px bg-gray-300"></div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Searchpage;
