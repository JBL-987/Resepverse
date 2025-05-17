import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import Swal from "sweetalert2";
import { useUser } from "../contexts/UserContext";
import Spline from "@splinetool/react-spline";
import { ConnectButton } from "@xellar/kit";
import { ArrowRight, ChevronDown, MessageSquare, Mic, Shield, Brain, Zap, Clock } from "lucide-react";
import "../styles/home.css";

const NewHome: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { user, signInWithGoogle } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Handle navigation to chat
  const handleStartChat = async () => {
    if (user) {
      // User is already logged in
      navigate("/chat");
    } else if (isConnected) {
      // Wallet is connected, go directly to chat
      // The AuthContext will handle the wallet connection
      navigate("/chat");
    } else {
      // This shouldn't happen since we're using ConnectButton.Custom
      // which only shows the Start Chatting button when wallet is connected
      Swal.fire({
        icon: "info",
        title: "Connect Wallet",
        text: "Please connect your wallet to continue.",
        background: "#1a1a1a",
        color: "#fff",
      });
    }
  };

  // Handle navigation to agent setup
  const handleAgentSetup = () => {
    if (user) {
      // User is already logged in
      navigate("/agent-setup");
    } else if (isConnected) {
      // Wallet is connected, go directly to agent setup
      // The AuthContext will handle the wallet connection
      navigate("/agent-setup");
    } else {
      // This shouldn't happen since we're using ConnectButton.Custom
      // which only shows the Setup Your Agent button when wallet is connected
      Swal.fire({
        icon: "info",
        title: "Connect Wallet",
        text: "Please connect your wallet to continue.",
        background: "#1a1a1a",
        color: "#fff",
      });
    }
  };

  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll indicator
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header/Navigation - with improved styling and mobile responsiveness */}
      <header className={`fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-8 flex justify-between items-center transition-all duration-300 ${
        scrolled ? "bg-black/90 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}>
        <div className="flex items-center">
          <h1 className="text-2xl font-bold gradient-text">
            Telepathia AI
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className="text-gray-300 hover:text-white transition-colors relative group"
          >
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="#how-it-works"
            className="text-gray-300 hover:text-white transition-colors relative group"
          >
            How It Works
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="#about"
            className="text-gray-300 hover:text-white transition-colors relative group"
          >
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        {/* Connect Button */}
        <div className="hidden md:block">
          <ConnectButton />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-4">
          <ConnectButton />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/95 pt-20 px-6 flex flex-col items-center"
          >
            <nav className="flex flex-col items-center space-y-6 w-full py-8">
              <a
                href="#features"
                className="text-xl text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-xl text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#about"
                className="text-xl text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Spline Background - enhanced with animations and better layout */}
      <section className="relative min-h-screen pt-32 pb-20 px-6 md:px-8 overflow-hidden">
        {/* Spline Background with improved overlay */}
        <div className="absolute inset-0 z-0">
          <Spline scene="https://prod.spline.design/uMTAOmqSa2pGMCzF/scene.splinecode" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90"></div>

          {/* Animated gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full filter blur-[100px] animate-pulse" style={{ animationDuration: "8s" }}></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-600/20 rounded-full filter blur-[120px] animate-pulse" style={{ animationDuration: "12s" }}></div>
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-violet-600/20 rounded-full filter blur-[80px] animate-pulse" style={{ animationDuration: "10s" }}></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 gradient-text leading-tight">
                  Text Without Texting
                </h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
              >
                Let your AI agent communicate on your behalf. Save time and
                mental energy with Telepathia AI.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <ConnectButton.Custom>
                  {({ openConnectModal, isConnected }) => {
                    if (!isConnected) {
                      return (
                        <div className="flex justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openConnectModal}
                            className="btn btn-lg btn-primary px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center"
                          >
                            <span className="text-lg font-medium">
                              Connect Wallet
                            </span>
                          </motion.button>
                        </div>
                      );
                    }

                    return (
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleStartChat}
                          className={`btn btn-lg btn-primary px-8 py-4 rounded-lg ${
                            isLoading
                              ? "bg-indigo-800"
                              : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                          } transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2`}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <div className="loading-spinner w-5 h-5"></div>
                              <span>Connecting...</span>
                            </>
                          ) : (
                            <>
                              <span>Start Chatting</span>
                              <ArrowRight size={18} />
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(99, 102, 241, 0.15)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleAgentSetup}
                          className="btn btn-lg btn-secondary px-8 py-4 rounded-lg border border-indigo-500 text-indigo-400 hover:bg-indigo-900/30 transition-colors flex items-center justify-center gap-2"
                        >
                          <span>Setup Your Agent</span>
                          <Brain size={18} />
                        </motion.button>
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
            >
              <span className="text-sm text-gray-400 mb-2">Scroll to explore</span>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronDown size={24} className="text-indigo-400" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced with better cards and animations */}
      <section id="features" className="py-24 px-6 md:px-8 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Powerful Features</h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Telepathia AI revolutionizes how you communicate with advanced AI technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Text Without Texting",
                description:
                  "Your AI agent handles routine communications while you focus on what matters most.",
                icon: <MessageSquare size={28} />,
                color: "from-indigo-500 to-blue-500",
                delay: 0.1
              },
              {
                title: "Voice Conversations",
                description:
                  "Speak naturally with your agent and hear responses in a pleasant voice.",
                icon: <Mic size={28} />,
                color: "from-blue-500 to-cyan-500",
                delay: 0.2
              },
              {
                title: "Blockchain Security",
                description:
                  "Your conversations are securely backed up on the blockchain for privacy and ownership.",
                icon: <Shield size={28} />,
                color: "from-indigo-500 to-violet-500",
                delay: 0.3
              },
              {
                title: "AI-Powered Responses",
                description:
                  "Advanced AI understands context and responds naturally to conversations.",
                icon: <Brain size={28} />,
                color: "from-violet-500 to-purple-500",
                delay: 0.4
              },
              {
                title: "Fast & Efficient",
                description:
                  "Get quick responses and handle multiple conversations simultaneously.",
                icon: <Zap size={28} />,
                color: "from-amber-500 to-orange-500",
                delay: 0.5
              },
              {
                title: "24/7 Availability",
                description:
                  "Your agent is always available, even when you're busy or sleeping.",
                icon: <Clock size={28} />,
                color: "from-emerald-500 to-teal-500",
                delay: 0.6
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="card bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 overflow-hidden relative group"
              >
                {/* Gradient background that appears on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                {/* Icon with gradient background */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5`}>
                  {feature.icon}
                </div>

                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Enhanced with better visuals and flow */}
      <section id="how-it-works" className="py-24 px-6 md:px-8 bg-black relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
          <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-indigo-600/20 filter blur-[100px]"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-blue-600/20 filter blur-[100px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">How It Works</h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Getting started with Telepathia AI is simple and straightforward
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection line for desktop */}
            <div className="hidden md:block absolute top-24 left-[calc(16.67%-8px)] right-[calc(16.67%-8px)] h-1 bg-gradient-to-r from-indigo-600/50 via-blue-600/50 to-indigo-600/50 rounded-full"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
              {[
                {
                  step: "01",
                  title: "Connect Your Wallet",
                  description:
                    "Connect your wallet to get started with Telepathia AI in seconds.",
                  icon: (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white text-xl font-bold">01</div>
                  )
                },
                {
                  step: "02",
                  title: "Configure Your Agent",
                  description:
                    "Set your preferences, communication style, and availability to personalize your AI agent.",
                  icon: (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xl font-bold">02</div>
                  )
                },
                {
                  step: "03",
                  title: "Let Your Agent Work",
                  description:
                    "Your AI agent handles communications while you focus on what matters most to you.",
                  icon: (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">03</div>
                  )
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step icon */}
                  <motion.div
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)" }}
                    transition={{ duration: 0.2 }}
                    className="mb-6 relative z-10"
                  >
                    {step.icon}
                  </motion.div>

                  {/* Content */}
                  <div className="max-w-xs mx-auto">
                    <h3 className="text-2xl font-semibold mb-3 text-white">{step.title}</h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>

                  {/* Arrow for desktop */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 right-0 transform translate-x-1/2 z-20">
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 8L28 20L15 32" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <ConnectButton.Custom>
              {({ openConnectModal, isConnected }) => (
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isConnected ? handleAgentSetup : openConnectModal}
                  className="btn btn-lg btn-primary px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 mx-auto"
                >
                  <span>{isConnected ? "Setup Your Agent Now" : "Get Started Now"}</span>
                  <ArrowRight size={18} />
                </motion.button>
              )}
            </ConnectButton.Custom>
          </motion.div>
        </div>
      </section>

      {/* About Section - Enhanced with better layout and visuals */}
      <section id="about" className="py-24 px-6 md:px-8 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">About Telepathia AI</h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Our mission is to revolutionize communication through AI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-xl relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-600/10 rounded-full filter blur-[50px]"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600/10 rounded-full filter blur-[50px]"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-semibold mb-6 text-white border-b border-indigo-500/30 pb-3">Our Mission & Vision</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-medium mb-3 text-indigo-400">Our Mission</h4>
                    <p className="text-gray-300 leading-relaxed">
                      Telepathia AI is revolutionizing human-AI interaction through
                      our advanced AI agent platform built with cutting-edge Web3
                      technology. Our mission is to create a world where you don't
                      have to repeat yourself - your AI agent handles communication on
                      your behalf, saving you time and mental energy.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xl font-medium mb-3 text-indigo-400">Our Vision</h4>
                    <p className="text-gray-300 leading-relaxed">
                      We envision a future where AI agents act as your digital
                      representatives, handling routine communications and gathering
                      information while you focus on what matters. Telepathia AI
                      strives to be at the forefront of this revolution, creating
                      tools that enhance human potential while respecting personal
                      autonomy.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-xl relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-600/10 rounded-full filter blur-[50px]"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-600/10 rounded-full filter blur-[50px]"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-semibold mb-6 text-white border-b border-indigo-500/30 pb-3">Our Core Principles</h3>

                <ul className="space-y-6">
                  <motion.li
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="flex items-start"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white mr-4">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <strong className="text-xl text-white block mb-1">
                        Text Without Texting
                      </strong>
                      <p className="text-gray-300 leading-relaxed">
                        Let your AI agent handle communications while you focus on
                        what matters most to you. No more repetitive conversations.
                      </p>
                    </div>
                  </motion.li>

                  <motion.li
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="flex items-start"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white mr-4">
                      <Brain size={20} />
                    </div>
                    <div>
                      <strong className="text-xl text-white block mb-1">
                        Don't Repeat Yourself
                      </strong>
                      <p className="text-gray-300 leading-relaxed">
                        Your agent remembers your preferences, schedule, and needs
                        so you don't have to explain them repeatedly to different people.
                      </p>
                    </div>
                  </motion.li>

                  <motion.li
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="flex items-start"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white mr-4">
                      <Shield size={20} />
                    </div>
                    <div>
                      <strong className="text-xl text-white block mb-1">
                        Blockchain Security
                      </strong>
                      <p className="text-gray-300 leading-relaxed">
                        Your conversations are securely backed up on the
                        blockchain, ensuring privacy and data ownership at all times.
                      </p>
                    </div>
                  </motion.li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced with better visuals and animations */}
      <section className="py-32 px-6 md:px-8 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-900/20 to-black opacity-80"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-[120px] animate-pulse" style={{ animationDuration: "15s" }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full filter blur-[120px] animate-pulse" style={{ animationDuration: "20s" }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Ready to transform how you communicate?
            </h2>

            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join Telepathia AI today and experience the future of communication
              with your personal AI agent.
            </p>

            <ConnectButton.Custom>
              {({ openConnectModal, isConnected }) => {
                if (!isConnected) {
                  return (
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(99, 102, 241, 0.5)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openConnectModal}
                      className="btn btn-lg btn-primary px-10 py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-500/30 text-xl font-medium"
                    >
                      Connect Wallet to Get Started
                    </motion.button>
                  );
                }

                return (
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(99, 102, 241, 0.5)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleStartChat}
                      className="btn btn-lg btn-primary px-10 py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-500/30 text-xl font-medium flex items-center justify-center gap-2"
                    >
                      <span>Start Chatting</span>
                      <MessageSquare size={20} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(99, 102, 241, 0.15)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAgentSetup}
                      className="btn btn-lg btn-secondary px-10 py-5 rounded-xl border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-900/30 transition-colors text-xl font-medium flex items-center justify-center gap-2"
                    >
                      <span>Setup Your Agent</span>
                      <Brain size={20} />
                    </motion.button>
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </motion.div>
        </div>
      </section>

      {/* Footer - Enhanced with better styling and animations */}
      <footer className="py-16 px-6 md:px-8 bg-black border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-8 md:mb-0"
            >
              <h3 className="text-2xl font-bold gradient-text mb-3">
                Telepathia AI
              </h3>
              <p className="text-gray-400 max-w-xs">
                The future of communication is here. Let your AI agent handle conversations for you.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-6"
            >
              <ConnectButton.Custom>
                {({ openConnectModal, isConnected }) => (
                  <button
                    onClick={isConnected ? handleStartChat : openConnectModal}
                    className="btn btn-primary px-6 py-2 rounded-lg"
                  >
                    {isConnected ? "Start Chatting" : "Connect Wallet"}
                  </button>
                )}
              </ConnectButton.Custom>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="font-medium mb-4 text-white">Product</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-gray-400 hover:text-indigo-400 transition-colors relative group"
                  >
                    Features
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-gray-400 hover:text-indigo-400 transition-colors relative group"
                  >
                    How It Works
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-indigo-400 transition-colors relative group"
                  >
                    Pricing
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="font-medium mb-4 text-white">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#about"
                    className="text-gray-400 hover:text-indigo-400 transition-colors relative group"
                  >
                    About
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-indigo-400 transition-colors relative group"
                  >
                    Blog
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-indigo-400 transition-colors relative group"
                  >
                    Careers
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h4 className="font-medium mb-4 text-white">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-indigo-400 transition-colors relative group"
                  >
                    Privacy
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-indigo-400 transition-colors relative group"
                  >
                    Terms
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-indigo-400 transition-colors relative group"
                  >
                    Security
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <h4 className="font-medium mb-4 text-white">Connect</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-indigo-400 transition-colors relative group"
                  >
                    Twitter
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-indigo-400 transition-colors relative group"
                  >
                    Discord
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-indigo-400 transition-colors relative group"
                  >
                    GitHub
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
            className="pt-8 border-t border-gray-800/50 text-center text-gray-500 text-sm"
          >
            <p>&copy; {new Date().getFullYear()} Telepathia AI. All rights reserved.</p>
            <p className="mt-2">Built with ❤️ for the future of communication</p>
          </motion.div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 1 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-indigo-600 text-white shadow-lg z-50"
        aria-label="Scroll to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>
    </div>
  );
};

export default NewHome;
