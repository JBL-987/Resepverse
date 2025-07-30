import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Globe, Coins, Users, Star, TrendingUp, Award, Zap, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/main', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Initialize Vanta.js effect
  useEffect(() => {
    if (vantaRef.current && window.VANTA && !vantaEffect.current) {
      vantaEffect.current = window.VANTA.NET({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0xd95a00,
        backgroundColor: 0x0,
        points: 15.00,
        maxDistance: 26.00,
        spacing: 16.00
      });
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  const [stats, setStats] = useState({
    recipes: 0,
    chefs: 0,
    earnings: 0,
    countries: 0
  });

  // Animate stats on load
  useEffect(() => {
    const animateStats = () => {
      const targets = { recipes: 12847, chefs: 3421, earnings: 84372, countries: 67 };
      const duration = 2000;
      const steps = 60;
      const increment = duration / steps;

      let current = { recipes: 0, chefs: 0, earnings: 0, countries: 0 };
      
      const timer = setInterval(() => {
        Object.keys(targets).forEach(key => {
          if (current[key] < targets[key]) {
            current[key] = Math.min(current[key] + Math.ceil(targets[key] / steps), targets[key]);
          }
        });
        
        setStats({...current});
        
        if (Object.values(current).every((val, idx) => val >= Object.values(targets)[idx])) {
          clearInterval(timer);
        }
      }, increment);
    };

    animateStats();
  }, []);

  const features = [
    {
      icon: <ChefHat className="w-6 h-6" />,
      title: "Cook-to-Earn",
      description: "Share recipes and earn $LSK tokens",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Marketplace",
      description: "Discover authentic recipes worldwide",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: "NFT Recipes",
      description: "Turn dishes into digital collectibles",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Driven",
      description: "Join food lovers and blockchain enthusiasts",
      color: "from-pink-500 to-rose-600"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Vanta.js Background */}
      <div ref={vantaRef} className="fixed inset-0 z-0" />
      
      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Header */}
        <Header />

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 font-medium">The Future of Cooking is Here</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Cook. Share.
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Earn Together.
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Welcome to <span className="text-orange-400 font-semibold">Resepverse</span> - the world's first decentralized recipe marketplace where culinary passion meets blockchain innovation.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-2">
                  {stats.recipes.toLocaleString()}+
                </div>
                <div className="text-gray-400 text-sm">Recipes Shared</div>
              </div>
              <div className="text-center backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-2xl md:text-3xl font-bold text-red-400 mb-2">
                  {stats.chefs.toLocaleString()}+
                </div>
                <div className="text-gray-400 text-sm">Active Chefs</div>
              </div>
              <div className="text-center backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-2">
                  ${stats.earnings.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">Total Earnings</div>
              </div>
              <div className="text-center backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">
                  {stats.countries}+
                </div>
                <div className="text-gray-400 text-sm">Countries</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-orange-400">Resepverse?</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Experience the perfect blend of culinary creativity and blockchain technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300 hover:scale-105 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-16 border-t border-white/10">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Resepverse</span>
            </div>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              The decentralized recipe marketplace where culinary passion meets blockchain innovation.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Contact</a>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 text-gray-500 text-sm">
              <p>&copy; 2025 Resepverse. All rights reserved. Cook with passion, earn with innovation.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;