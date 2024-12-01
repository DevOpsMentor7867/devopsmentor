import React from "react";
// import { Link } from "react-router-dom";
import NavBar from "../Core/NavBar";
import DoodleComp from "../Core/DoodleComp";
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <>
      <NavBar />
      <DoodleComp />

      <section className="relative bg-gray-700 bg-blend-multiply">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/placeholder.svg?height=600&width=800"
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        >
          <source src="devops.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="px-4 mx-auto max-w-screen-xl text-center py-24 lg:py-56 relative">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-8xl text-green-500">
            . <br /> .
          </h1>
          <p className="mb-8 text-lg font-normal text-gray-300 lg:text-xl sm:px-16 lg:px-48">
            {/* Here at Flowbite we focus on markets where technology, innovation,
            and capital can unlock long-term value and drive economic growth. */}
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
            <a
              href="/"
              className="inline-flex justify-center items-center py-3 px-5 text-base text-center bg-gradient-to-r from-[#80EE98] to-[#09D1C7] text-[#1A202C] hover:from-[#09D1C7] hover:to-[#80EE98] rounded-md font-bold"
            >
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <a
              href="/"
              className="inline-flex justify-center hover:text-gray-900 items-center py-3 px-5 sm:ms-4 text-base font-medium text-center text-white rounded-lg border border-white hover:bg-gray-100 focus:ring-4 focus:ring-gray-400"
            >
              Learn more
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
