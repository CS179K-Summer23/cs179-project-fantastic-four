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



    </div>
  );
}

export default Streamingroom;
