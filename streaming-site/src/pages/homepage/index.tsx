/* eslint-disable @next/next/no-img-element */
import React from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Link from "next/link";

function Homepage(): JSX.Element {
  const categories = ["VALORANT", "League of Legends"];
  const streams = [1, 2, 3, 4];

  const streamerAvatarUrl = "https://url-to-streamer-avatar.com/avatar.jpg"; // replace with real avatar URL

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar></Navbar>

      <main className="flex-1">
        <div className="container mx-auto p-8">
          <section>
            <h2 className="text-2xl font-bold my-4">Live Streaming Room</h2>
            <div className="rounded overflow-hidden shadow-lg p-4 bg-white">
              <div className="relative pb-3/2">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://player.twitch.tv/?channel=channel_name&parent=streamerwebsite.com"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </section>

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
                        src="https://www.youtube.com/embed/SqcY0GlETPk"
                        allowFullScreen
                      ></iframe>
                    </div>

                    <div className="">
                      <div
                        className="relative"
                        style={{ paddingBottom: "56.25%" }}
                      >
                        <iframe
                          src="https://www.youtube.com/embed/SqcY0GlETPk"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                          }}
                          frameBorder="0"
                          scrolling="no"
                          allowFullScreen={true}
                        ></iframe>
                      </div>

                      <div>
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/149/149071.png?w=740&t=st=1691147917~exp=1691148517~hmac=eb6166a62265ce27b7afac68d87a03b748bc37c5361e49e55c8ced8a2f60e2db"
                          className="mt-2 w-7 h-7 rounded-full float-left mr-2"
                          alt="Streamer avatar"
                        />
                        <div className="pl-9">
                          <h3 className="font-bold text-xl hover:text-gray-500">
                            <Link href="/streamingroom">
                              Stream Title {stream}
                            </Link>
                          </h3>
                          <Link
                            href="/streamingroom"
                            className="text-sm text-gray-700 hover:text-gray-500"
                          >
                            Stream description here...
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer></Footer>
    </div>
  );
}

export default Homepage;
