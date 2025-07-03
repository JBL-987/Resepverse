import React, { useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Home: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
        }
      );
    }
    if (featuresRef.current) {
      gsap.fromTo(
        featuresRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      <div ref={heroRef} className="w-full flex flex-col items-center justify-center bg-black py-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-blue-400 mb-4 text-center">ResepVerse</h1>
        <p className="text-lg md:text-2xl text-gray-300 max-w-2xl text-center mb-8">
          ResepVerse is an inspiring platform where everyone can share and discover innovative recipes from communities around the world. Every recipe is securely and transparently recorded on the Lisk blockchain, ensuring authenticity, ownership, and creative culinary collaboration.
        </p>
        <a href="/submit" className="px-8 py-3 rounded-lg bg-blue-700 text-white font-semibold shadow hover:bg-blue-800 transition text-lg">Submit New Recipe</a>
      </div>
      <main className="max-w-5xl mx-auto py-8 px-4 md:px-0">
        <section ref={featuresRef} className="mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-blue-300">Why ResepVerse?</h2>
          <ul className="list-disc pl-5 text-gray-200 space-y-2 text-left max-w-xl mx-auto mt-6">
            <li>✅ Community platform for sharing innovative recipes.</li>
            <li>✅ Every recipe is recorded on the Lisk blockchain, transparent & immutable.</li>
            <li>✅ On-chain voting & reputation system to reward recipe creators.</li>
            <li>✅ Potential for rewards like badges or tokens.</li>
          </ul>
        </section>
        <section className="mb-12 text-center">
          <h2 className="text-xl font-bold text-blue-400 mb-4">Get Started</h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <a href="/recipes" className="px-6 py-3 rounded-lg bg-gray-900 border border-gray-700 text-blue-300 font-semibold hover:bg-gray-800 transition">Explore Recipes</a>
            <a href="/submit" className="px-6 py-3 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 transition">Submit Your Recipe</a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
