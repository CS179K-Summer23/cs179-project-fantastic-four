import React from 'react';

function Homepage(): JSX.Element {

  const categories = ['VALORANT', 'League of Legends'];
  const streams = [1, 2, 3, 4];

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
        <div className="flex items-center flex-shrink-0 text-white mr-6">
          <a className="font-semibold text-xl tracking-tight" href="#">Fantastic Four</a>
        </div>
        <div className="block lg:hidden">
          <button className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>
        <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
          <div className="text-sm lg:flex-grow">
            <a href="#" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">Home</a>
            <a href="#" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">Streams</a>
            <a href="#" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white">Categories</a>
          </div>
          <div>
            <form className="text-sm">
              <input className="bg-grey-lighter border-2 rounded py-2 px-4" type="search" placeholder="Search" />
              <button className="flex-shrink-0 text-sm py-2 px-4 rounded" type="button">Search</button>
            </form>
          </div>
          <div>
            <a href="/signin" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0">Login</a>
            <a href="/signup" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0">Sign Up</a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        <div className="w-full max-w-md mx-auto mt-4">
          <div className="relative pt-3/2">
            <iframe className="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/tgbNymZ7vqY" allowFullScreen></iframe>
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
