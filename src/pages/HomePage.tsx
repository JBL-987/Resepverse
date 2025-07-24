import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Globe, Coins, Users, Star, TrendingUp, Award, Zap } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/main', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [activeFeature, setActiveFeature] = useState(0);
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
      icon: <ChefHat className="w-8 h-8" />,
      title: "Cook-to-Earn",
      description: "Share your favorite recipes and earn $LSK tokens from the community",
      color: "from-orange-400 to-red-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Marketplace",
      description: "Discover authentic recipes from master chefs around the world",
      color: "from-blue-400 to-purple-500"
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "NFT Recipes",
      description: "Turn your signature dishes into valuable digital collectibles",
      color: "from-green-400 to-teal-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Driven",
      description: "Join a vibrant community of food lovers and blockchain enthusiasts",
      color: "from-pink-400 to-rose-500"
    }
  ];

  const testimonials = [
    {
      name: "Chef Maria Santos",
      location: "São Paulo, Brazil",
      text: "I've earned over 5,000 $LSK tokens sharing my grandmother's recipes!",
      rating: 5,
      avatar: "👩‍🍳"
    },
    {
      name: "David Kim",
      location: "Seoul, Korea",
      text: "The platform helped me discover amazing dishes I never knew existed.",
      rating: 5,
      avatar: "👨‍🍳"
    },
    {
      name: "Isabella Ferrari",
      location: "Rome, Italy",
      text: "My pasta recipe NFT sold for 2 ETH! This platform is revolutionary.",
      rating: 5,
      avatar: "👩‍🍳"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-orange-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-orange-700 font-medium">The Future of Cooking is Here</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              Cook. Share.
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Earn Together.
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Welcome to <strong>Resepverse</strong> - the world's first decentralized recipe marketplace where culinary passion meets blockchain innovation. Share your recipes, learn from master chefs, and earn $LSK tokens.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2">
              <ChefHat className="w-5 h-5" />
              <span>Start Cooking</span>
            </button>
            <button className="border-2 border-orange-300 text-orange-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-50 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Explore Recipes</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                {stats.recipes.toLocaleString()}+
              </div>
              <div className="text-gray-600">Recipes Shared</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                {stats.chefs.toLocaleString()}+
              </div>
              <div className="text-gray-600">Active Chefs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                ${stats.earnings.toLocaleString()}
              </div>
              <div className="text-gray-600">Total Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {stats.countries}+
              </div>
              <div className="text-gray-600">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="text-orange-500">Resepverse?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the perfect blend of culinary creativity and blockchain technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group"
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-white">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Loved by Chefs Worldwide
            </h2>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Join thousands of culinary artists earning from their passion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-orange-200 text-sm">{testimonial.location}</div>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-300 fill-current" />
                  ))}
                </div>
                <p className="text-orange-100 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-12 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your Culinary Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join Resepverse today and transform your cooking passion into earnings. The kitchen of the future awaits!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2">
                <ChefHat className="w-5 h-5" />
                <span>Become a Chef</span>
              </button>
              <button className="border-2 border-orange-300 text-orange-300 px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2">
                <Coins className="w-5 h-5" />
                <span>Mint Recipe NFT</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Resepverse</span>
              </div>
              <p className="text-gray-400 mb-4">
                The decentralized recipe marketplace where culinary passion meets blockchain innovation.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Explore Recipes</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Become a Chef</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">NFT Marketplace</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Tokenomics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Telegram</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Resepverse. All rights reserved. Cook with passion, earn with innovation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;