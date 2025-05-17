import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spline from "@splinetool/react-spline";
import Swal from "sweetalert2";
import { useAccount } from "wagmi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { SectionCardProps } from "../types";
import { useUser } from "../contexts/UserContext";

gsap.registerPlugin(ScrollTrigger);

const SectionCard: React.FC<SectionCardProps> = ({ id, title, content }) => {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="min-h-screen flex items-center justify-center bg-black text-white px-4 relative z-10 py-24 mt-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl"
      >
        <div className="relative">
          {/* Decorative elements - smaller and less intrusive */}
          <div className="absolute -top-5 -left-5 w-20 h-20 bg-indigo-600 rounded-full filter blur-[50px] opacity-10"></div>
          <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-blue-600 rounded-full filter blur-[50px] opacity-10"></div>

          <div className="card overflow-hidden bg-gray-900 border border-gray-800 rounded-xl shadow-lg">
            <div className="card-body p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></div>
                <h2 className="card-title text-white text-2xl md:text-3xl font-bold">
                  {title}
                </h2>
              </div>

              <div className="text-gray-300 md:text-base space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {content}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const Home: React.FC = () => {
  const { isConnected } = useAccount();
  const { user, signInWithGoogle } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const splineRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      // If user is logged in but not onboarded, redirect to onboarding
      if (!user.isOnboarded) {
        navigate("/onboarding");
      }
    }
  }, [user, navigate]);

  // Animation setup
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          scrub: 1,
          start: "top top",
          end: "+=1000px",
          pin: headerRef.current,
          pinSpacing: false,
        },
      });
      tl.from(splineRef.current, {
        clipPath: "inset(15%)",
        filter: "brightness(60%)",
        ease: "power2.out",
      })
        .to(
          splineRef.current,
          {
            scale: 0.8,
            duration: 0.1,
          },
          0
        )
        .to(
          headerRef.current?.querySelector("h1"),
          {
            opacity: 0,
            y: -50,
            duration: 0.1,
          },
          0
        )
        .to(
          headerRef.current?.querySelector("p"),
          {
            opacity: 0,
            y: -50,
            duration: 0.1,
          },
          0
        )
        .to(
          headerRef.current?.querySelector("button"),
          {
            opacity: 0,
            y: -50,
            duration: 0.1,
          },
          0
        );

      gsap.utils.toArray("section").forEach((section, i) => {
        sectionsRef.current[i] = section as HTMLElement;
        gsap.fromTo(
          section,
          {
            opacity: 0,
            y: 100,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Event handlers
  const handleChat = async () => {
    if (user) {
      // User is already logged in
      navigate("/chat");
    } else if (isConnected) {
      // Wallet is connected but user is not logged in
      navigate("/login");
    } else {
      // Try to sign in with Google
      try {
        setIsLoading(true);
        await signInWithGoogle();
        // Will be redirected by the useEffect above if needed
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Authentication Failed",
          text: "Please try again or connect your wallet first!",
          background: "#1a1a1a",
          color: "#fff",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAgentSetup = async () => {
    if (user) {
      // User is already logged in
      navigate("/agent-setup");
    } else if (isConnected) {
      // Wallet is connected but user is not logged in
      navigate("/login");
    } else {
      Swal.fire({
        icon: "info",
        title: "Authentication Required",
        text: "Please sign in or connect your wallet to set up your agent.",
        background: "#1a1a1a",
        color: "#fff",
        showCancelButton: true,
        confirmButtonText: "Sign In",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full font-sans bg-black overflow-hidden"
    >
      <Navbar />

      <div
        ref={headerRef}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6"
      >
        <div ref={splineRef} className="absolute inset-0 w-full h-full -z-10">
          <Spline scene="https://prod.spline.design/uMTAOmqSa2pGMCzF/scene.splinecode" />

          {/* Additional visual elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80"></div>
          <div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full filter blur-[100px] animate-pulse"
            style={{ animationDuration: "8s" }}
          ></div>
          <div
            className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-600/20 rounded-full filter blur-[120px] animate-pulse"
            style={{ animationDuration: "12s" }}
          ></div>
        </div>

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full max-w-5xl mx-auto flex flex-col items-center text-center gap-8 relative"
        >
          {/* Floating elements */}
          <motion.div
            className="absolute -top-20 -left-10 w-20 h-20 rounded-full border border-indigo-500/30"
            animate={{
              y: [0, 15, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute top-40 -right-10 w-12 h-12 rounded-full border border-blue-500/30"
            animate={{
              y: [0, -20, 0],
              rotate: [0, -8, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />

          {/* Main content */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 rounded-full backdrop-blur-sm border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-4"
            >
              The Future of Communication
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold text-white drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)]"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">
                Telepathia
              </span>{" "}
              AI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto drop-shadow-lg"
            >
              Text without texting. Let your AI agent communicate for you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col md:flex-row gap-4 mt-8 justify-center"
            >
              <button
                className={`relative overflow-hidden group rounded-full px-8 py-4 font-medium shadow-xl ${
                  isLoading
                    ? "bg-indigo-700 cursor-wait"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white transition-all duration-300 hover:scale-105 active:scale-95`}
                onClick={handleChat}
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Start Chatting</span>
                    </>
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>

              <button
                className="relative overflow-hidden group rounded-full px-8 py-4 font-medium shadow-xl bg-transparent border-2 border-white/30 text-white hover:border-white/80 transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={handleAgentSetup}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Setup Your Agent</span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </motion.div>
          </div>

          {/* Features preview - more compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4 mt-12 w-full max-w-4xl"
          >
            {[
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                ),
                title: "Text Without Texting",
                description: "Let your AI agent handle communications",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                ),
                title: "Voice Conversations",
                description: "Natural female voice interaction",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                ),
                title: "Blockchain Security",
                description: "Secure conversation backup",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-indigo-500/30 transition-all duration-300 w-[30%] min-w-[180px]"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center mb-2 text-indigo-400">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-xs">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator - smaller and less intrusive */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex flex-col items-center"
            >
              <span className="text-gray-500 text-xs mb-1">Scroll</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
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
        </motion.main>
      </div>

      <div className="relative z-10">
        <SectionCard
          id="about-us"
          title="About Us"
          content={
            <>
              <h3 className="text-xl font-bold mt-4 mb-2">Our Mission</h3>
              <p>
                Telepathia-AI is revolutionizing human-AI interaction through
                our advanced AI agent platform built with cutting-edge Web3
                technology. Our mission is to create a world where you don't
                have to repeat yourself - your AI agent handles communication on
                your behalf, saving you time and mental energy.
              </p>

              <h3 className="text-xl font-bold mt-4 mb-2">Our Vision</h3>
              <p>
                We envision a future where AI agents act as your digital
                representatives, handling routine communications and gathering
                information while you focus on what matters. Telepathia-AI
                strives to be at the forefront of this revolution, creating
                tools that enhance human potential while respecting personal
                autonomy.
              </p>

              <h3 className="text-xl font-bold mt-4 mb-2">Our Principles</h3>
              <p>
                <strong>Text Without Texting:</strong> Let your AI agent handle
                communications while you focus on what matters.
                <br />
                <strong>Don't Repeat Yourself:</strong> Your agent remembers
                your preferences, schedule, and needs so you don't have to
                explain them repeatedly.
                <br />
                <strong>Blockchain Security:</strong> Your conversations are
                securely backed up on the blockchain, ensuring privacy and data
                ownership.
              </p>
            </>
          }
        />

        <SectionCard
          id="privacy-policy"
          title="Privacy Policy"
          content={
            <>
              <h3 className="text-xl font-bold mt-4 mb-2">Data Ownership</h3>
              <p>
                At Telepathia-AI, we believe your data belongs to you and only
                you. Unlike traditional AI services, we do not store
                conversations on central servers. Your interactions remain fully
                encrypted and stored locally or on your preferred decentralized
                storage solution.
              </p>

              <h3 className="text-xl font-bold mt-4 mb-2">No Data Mining</h3>
              <p>
                We will never mine your conversations for training data or
                marketing insights. Your communications with our AI assistant
                are private and will not be used to improve our models without
                your explicit, opt-in consent.
              </p>

              <h3 className="text-xl font-bold mt-4 mb-2">Transparency</h3>
              <p>
                Our privacy protocols are open-source and auditable by the
                community. We regularly publish transparency reports and invite
                independent security researchers to evaluate our systems.
              </p>

              <h3 className="text-xl font-bold mt-4 mb-2">Compliance</h3>
              <p>
                While embracing Web3 principles, Telepathia-AI complies with
                relevant data protection regulations including GDPR, CCPA, and
                other applicable privacy laws where our services are available.
              </p>
            </>
          }
        />

        <SectionCard
          id="products"
          title="Our Products"
          content={
            <>
              <h3 className="text-xl font-bold mt-4 mb-2">Telepathia Agent</h3>
              <p>
                Our flagship AI agent platform with unparalleled communication
                capabilities. Your agent learns your preferences, schedule, and
                communication style to represent you effectively in digital
                conversations.
              </p>

              <h3 className="text-xl font-bold mt-4 mb-2">Agent Marketplace</h3>
              <p>
                Customize your agent with specialized skills and knowledge
                domains. Choose from our marketplace of agent personalities and
                capabilities to create the perfect digital representative for
                your needs.
              </p>

              <h3 className="text-xl font-bold mt-4 mb-2">
                Telepathia for Teams
              </h3>
              <p>
                Enhance team collaboration with AI agents that facilitate
                meetings, gather consensus, and handle routine communications.
                Agents can interact with each other to resolve scheduling
                conflicts and coordinate activities without human intervention.
              </p>

              <h3 className="text-xl font-bold mt-4 mb-2">
                Telepathia Protocol
              </h3>
              <p>
                Our decentralized infrastructure for secure agent-to-agent
                communication. Built on blockchain technology to ensure privacy,
                data ownership, and transparent governance of the agent
                ecosystem.
              </p>
            </>
          }
        />

        <SectionCard
          id="contact"
          title="Contact Us"
          content={
            <>
              <h3 className="text-xl font-bold mt-4 mb-2">General Inquiries</h3>
              <p>
                Email: team@telepathia.ai
                <br />
                Twitter: @TelepathiaAI
                <br />
                Discord: discord.telepathia.ai
              </p>

              <h3 className="text-xl font-bold mt-4 mb-2">
                Business Development
              </h3>
              <p>
                For partnership opportunities and enterprise solutions:
                <br />
                Email: partnerships@telepathia.ai
                <br />
                Schedule a call: calendly.com/telepathia-partnerships
              </p>

              <h3 className="text-xl font-bold mt-4 mb-2">Support</h3>
              <p>
                Technical support and customer service:
                <br />
                Email: support@telepathia.ai
                <br />
                Help Center: help.telepathia.ai
                <br />
                Response Time: Within 24 hours
              </p>

              <h3 className="text-xl font-bold mt-4 mb-2">Office Locations</h3>
              <p>
                Singapore HQ: 60 Anson Road, #12-01, Singapore 079914
                <br />
                San Francisco: 535 Mission St, 14th Floor, San Francisco, CA
                94105
              </p>
            </>
          }
        />
      </div>

      <Footer />
    </div>
  );
};

export default Home;
