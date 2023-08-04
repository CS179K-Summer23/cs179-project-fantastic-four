import React from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

function StreamingRoom(): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="container mx-auto py-2 flex flex-col-reverse md:flex-row">
          <section className="w-full md:w-2/3 p-4">
            <div className="rounded overflow-hidden shadow-lg p-2 bg-white">
              <div style={{ position: "relative", paddingBottom: "56.25%" }}>
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
              <div className="mt-4">
                <h2 className="font-bold text-xl mb-2">Stream Title</h2>
                <p className="text-gray-700 text-base">
                  Stream description here...
                </p>
              </div>
            </div>
          </section>

          <section
            className="flex flex-col justify-between w-full md:w-1/3 mt-4 pt-2 px-2 bg-white"
            style={{ maxWidth: "350px" }}
          >
            <div className="bg-white">
              <h2 className="font-bold text-center border-b-2 text-m pb-1">STREAM CHAT</h2>
              <div className="chat-container p-0 m-0">{/* Chat content */}</div>
            </div>

            <form className="my-4 flex bg-white m">
              <input
                className="w-full rounded-l-lg p-2 border border-blue-500"
                type="text"
                placeholder="Write a message..."
              />
              <button className="py-2 px-2 bg-transparent bg-blue-500 text-blue-700 font-semibold hover:text-white border border-blue-500 hover:border-transparent rounded-r-lg">
                Send
              </button>
            </form>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default StreamingRoom;
