import React from 'react';
import Link from 'next/link'

function Streamingroom(): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen">
        <nav className="flex items-center justify-between bg-gray-900 flex-wrap p-6">
            <div className="flex items-center flex-shrink-0 text-teal-200 mr-6">
                <a className="font-semibold text-xl tracking-tight" href="#">Fantastic Four</a>
            </div>
            <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
                <div className="text-sm lg:flex-grow">
                <a href="#" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4">Home</a>
                <a href="#" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white mr-4">Streams</a>
                <a href="#" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white">Categories</a>
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



    </div>
  );
}

export default Streamingroom;
