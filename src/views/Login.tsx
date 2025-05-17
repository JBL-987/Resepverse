import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import Spline from "@splinetool/react-spline";

const Login: React.FC = () => {
  const { user, loading, error, signInWithGoogle } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Check if user needs onboarding
      if (!user.isOnboarded) {
        navigate('/onboarding');
      } else {
        navigate('/chat');
      }
    }
  }, [user, navigate]);
  
  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
    } finally {
      setIsSigningIn(false);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-full mb-4 opacity-50"></div>
          <div className="h-4 w-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Background animation */}
      <div className="fixed inset-0 w-full h-full -z-10">
        <Spline scene="https://prod.spline.design/uMTAOmqSa2pGMCzF/scene.splinecode" />
      </div>
      
      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="text-center mb-10"
            variants={itemVariants}
          >
            <h1 className="text-4xl font-bold mb-2">Telepathia AI</h1>
            <p className="text-gray-400">Text without texting. Let your AI agent communicate for you.</p>
          </motion.div>
          
          <motion.div 
            className="bg-gray-900 bg-opacity-70 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-gray-800"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-semibold mb-6 text-center">Sign In</h2>
            
            {error && (
              <motion.div 
                className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-lg mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-4">
              {/* Google Sign In Button */}
              <motion.button
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium p-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSigningIn ? (
                  <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </motion.button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">or continue as guest</span>
                </div>
              </div>
              
              {/* Guest Button */}
              <motion.button
                className="w-full bg-indigo-600 font-medium p-3 rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => navigate('/chat')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try as Guest
              </motion.button>
            </div>
          </motion.div>
          
          <motion.p 
            className="text-center mt-8 text-gray-400 text-sm"
            variants={itemVariants}
          >
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
