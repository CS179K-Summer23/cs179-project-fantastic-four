import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  RedditShareButton,
  RedditIcon,
  InstagramIcon,
  InstapaperShareButton,
} from "next-share";
function Share() {
  const [isOpen, setIsOpen] = useState(false);
  const url = "http://localhost:3000/streamingroom1";
  const title = "Check out my article!";

  return (
    <div className="relative inline-block text-left">
      <button
        className="text-center ml-1 bg-gray-900 text-white font-bold rounded-lg px-2 py-1 hover:bg-gray-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          className="w-6 h-6 inline-block mr-1"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
          />
        </svg>
        Share
      </button>
      {isOpen && (
        <div className="absolute -top-20 right-0 z-8 w-40 origin-top-right rounded-md bg-white shadow-lg focus:outline-none">
          <text className="pl-1 text-sm font-bold">Share via</text>
          <div className="py-1 flex justify-around">
            <TwitterShareButton
              url={url}
              title={title}
              className="px-2 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <TwitterIcon size={32} round />
            </TwitterShareButton>
            <FacebookShareButton
              url={url}
              quote={title}
              className="px-2 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FacebookIcon size={32} round />
            </FacebookShareButton>
            <RedditShareButton
              url={url}
              title={title}
              className="px-2 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <RedditIcon size={32} round />
            </RedditShareButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default Share;
