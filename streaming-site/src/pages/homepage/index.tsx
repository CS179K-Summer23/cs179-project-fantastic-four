import React from "react";
import Navbar from "../../components/navbar";

function Homepage(): JSX.Element {
  const categories = ["VALORANT", "League of Legends"];
  const streams = [1, 2, 3, 4];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar></Navbar>

      <main className="flex-1">
        <div className="container mx-auto p-8">
          {categories.map((category) => (
            <section key={category}>
              <h2 className="text-2xl font-bold my-4">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {streams.map((stream) => (
                  <div
                    key={stream}
                    className="rounded overflow-hidden shadow-lg p-4 bg-white"
                  >
                    <div className="relative pb-3/2">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src=""
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-xl mb-2">
                        Stream Title {stream}
                      </h3>
                      <p className="text-gray-700 text-base">
                        Stream description here...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="py-5 bg-gray-800 text-white">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            &copy; 2023 Fantastic Four. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;
