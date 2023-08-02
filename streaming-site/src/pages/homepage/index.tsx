import React from 'react';

function Homepage(): JSX.Element {

  const categories = ['VALORANT', 'League of Legends'];
  const streams = [1, 2, 3, 4];

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="flex items-center justify-between bg-gray-900 flex-wrap p-6">
            <div className="flex items-center flex-shrink-0 text-teal-200 mr-6">
                <a className="font-semibold text-xl tracking-tight" href="#">Fantastic Four</a>
            </div>
            <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
                <div className="text-sm lg:flex-grow">
                    <a href="/homepage" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4">Home</a>
                    <a href="#" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4">Streams</a>
                    <a href="#" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white">Categories</a>
                </div>

                


                <div>
                    <form className="text-sm">
                        <input className="bg-grey-lighter border-2 rounded py-2 px-4" type="search" placeholder="Search" />
                        <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Search</button>
                    </form>
                </div>

                <div>
                <a href="/signin"  className="py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Login</a>

                <a href="/signup"  className="py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Sign Up</a>
         
                </div>
            </div>
      </nav>

      <div className="container mx-auto px-4">
        <div className="w-full max-w-md mx-auto mt-4">
          <div className="relative pt-3/2">
            
          </div>
        </div>

        {categories.map(category => (
          <div key={category}>
            <h2 className="mt-4 text-2xl">{category}</h2>
            <div className="flex flex-wrap -mx-2">
              {streams.map(stream => (
                <div key={stream} className="w-full sm:w-1/2 md:w-1/4 px-2">
                  <div className="mb-4 rounded overflow-hidden shadow-lg">
                    <div className="relative pt-3/2">
                      <iframe className="absolute top-0 left-0 w-full h-full" src="" allowFullScreen></iframe>
                    </div>
                    <div className="px-6 py-4">
                      <div className="font-bold text-xl mb-2">Stream Title</div>
                      <p className="text-gray-700 text-base">Stream description here...</p>
                      <a href="/streamingroom">Join the room</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-auto py-3 bg-gray-300">
        <div className="container mx-auto text-center">
          <span className="text-gray-700">© 2023 Fantastic Four. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Homepage
