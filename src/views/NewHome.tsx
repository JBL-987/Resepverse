import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import Swal from "sweetalert2";
import { useUser } from "../contexts/UserContext";
import Spline from "@splinetool/react-spline";
import { ConnectButton } from "@xellar/kit";
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

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header/Navigation */}
      <header className="py-6 px-8 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">
            Telepathia AI
          </h1>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-gray-300 hover:text-white transition-colors"
          >
            How It Works
          </a>
          <a
            href="#about"
            className="text-gray-300 hover:text-white transition-colors"
          >
            About
          </a>
        </nav>
        <div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section with Spline Background */}
      <section className="relative min-h-screen py-20 px-8 overflow-hidden">
        {/* Spline Background */}
        <div className="absolute inset-0 z-0">
          <Spline scene="https://prod.spline.design/uMTAOmqSa2pGMCzF/scene.splinecode" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Text Without <span className="text-indigo-400">Texting</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Let your AI agent communicate on your behalf. Save time and
                mental energy with Telepathia AI.
              </p>
              <ConnectButton.Custom>
                {({ openConnectModal, isConnected }) => {
                  if (!isConnected) {
                    return (
                      <div className="flex justify-center">
                        <button
                          onClick={openConnectModal}
                          className="px-8 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center"
                        >
                          <span className="text-lg font-medium">
                            Connect Wallet
                          </span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={handleStartChat}
                        className={`px-6 py-3 rounded-lg ${
                          isLoading
                            ? "bg-indigo-800"
                            : "bg-indigo-600 hover:bg-indigo-700"
                        } transition-colors flex items-center justify-center`}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <span>Start Chatting</span>
                        )}
                      </button>
                      <button
                        onClick={handleAgentSetup}
                        className="px-6 py-3 rounded-lg bg-transparent border border-indigo-600 hover:bg-indigo-900 transition-colors"
                      >
                        Setup Your Agent
                      </button>
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </motion.div>

            {/* Feature highlights instead of floating card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
              {[
                {
                  title: "Text Without Texting",
                  description: "Let your AI agent handle communications",
                },
                {
                  title: "Voice Conversations",
                  description: "Natural female voice interaction",
                },
                {
                  title: "Blockchain Security",
                  description: "Secure conversation backup",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-lg p-4 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-xs">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex flex-col items-center"
            >
              <span className="text-gray-400 text-sm mb-1">
                Scroll to explore
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-8 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Telepathia AI revolutionizes how you communicate with advanced AI
              technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Text Without Texting",
                description:
                  "Your AI agent handles routine communications while you focus on what matters most.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                ),
              },
              {
                title: "Voice Conversations",
                description:
                  "Speak naturally with your agent and hear responses in a pleasant female voice.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                ),
              },
              {
                title: "Blockchain Security",
                description:
                  "Your conversations are securely backed up on the blockchain for privacy and ownership.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                ),
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800 p-6 rounded-lg border border-gray-700"
              >
                <div className="text-indigo-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Getting started with Telepathia AI is simple and straightforward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description:
                  "Sign up with Google or connect your wallet to get started.",
              },
              {
                step: "02",
                title: "Configure Your Agent",
                description:
                  "Set your preferences, communication style, and availability.",
              },
              {
                step: "03",
                title: "Let Your Agent Work",
                description:
                  "Your AI agent handles communications while you focus on what matters.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-5xl font-bold text-indigo-600/20 mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 right-0 transform translate-x-1/2">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 0L40 20L20 40L0 20L20 0Z"
                        fill="#4F46E5"
                        fillOpacity="0.1"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-8 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">About Telepathia AI</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our mission is to revolutionize communication through AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
              <p className="text-gray-400 mb-6">
                Telepathia AI is revolutionizing human-AI interaction through
                our advanced AI agent platform built with cutting-edge Web3
                technology. Our mission is to create a world where you don't
                have to repeat yourself - your AI agent handles communication on
                your behalf, saving you time and mental energy.
              </p>

              <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
              <p className="text-gray-400">
                We envision a future where AI agents act as your digital
                representatives, handling routine communications and gathering
                information while you focus on what matters. Telepathia AI
                strives to be at the forefront of this revolution, creating
                tools that enhance human potential while respecting personal
                autonomy.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Our Principles</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-white">
                      Text Without Texting:
                    </strong>
                    <p className="text-gray-400">
                      Let your AI agent handle communications while you focus on
                      what matters.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-white">
                      Don't Repeat Yourself:
                    </strong>
                    <p className="text-gray-400">
                      Your agent remembers your preferences, schedule, and needs
                      so you don't have to explain them repeatedly.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-white">Blockchain Security:</strong>
                    <p className="text-gray-400">
                      Your conversations are securely backed up on the
                      blockchain, ensuring privacy and data ownership.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to transform how you communicate?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join Telepathia AI today and experience the future of communication
            with your personal AI agent.
          </p>
          <ConnectButton.Custom>
            {({ openConnectModal, isConnected }) => {
              if (!isConnected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-lg font-medium"
                  >
                    Connect Wallet
                  </button>
                );
              }

              return (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleStartChat}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-lg font-medium"
                  >
                    Start Chatting
                  </button>
                  <button
                    onClick={handleAgentSetup}
                    className="px-8 py-4 bg-transparent border border-indigo-600 hover:bg-indigo-900 rounded-lg transition-colors text-lg font-medium"
                  >
                    Setup Your Agent
                  </button>
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">
                Telepathia AI
              </h3>
              <p className="text-gray-400">
                The future of communication is here.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#about"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Telepathia AI. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewHome;
