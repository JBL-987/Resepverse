import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center flex-grow p-4">
        <div className="text-6xl font-bold text-red-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;