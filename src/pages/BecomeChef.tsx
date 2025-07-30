import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChefHat, Star, Award, Sparkles, Globe, Zap } from 'lucide-react';
import Header from '@/components/Header';
import { useRecipeStore } from '@/store/recipestore';
import Swal from 'sweetalert2';
import { useWriteContract, useAccount, usePublicClient } from 'wagmi';
import { resepverseABI } from '@/utils/abi'; // Updated import to use the new ABI
import { RECIPE_BOOK_ADDRESS } from '@/constants';

const BecomeChef = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    specialties: '',
    bio: '',
    portfolio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addRecipe } = useRecipeStore();
  const { writeContractAsync } = useWriteContract();
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!account) {
        await Swal.fire({
          title: '🔗 Wallet Not Connected',
          text: 'Please connect your wallet to become a chef.',
          icon: 'warning',
          background: '#1f2937',
          color: '#ffffff',
          confirmButtonColor: '#f97316',
          confirmButtonText: 'OK'
        });
        setIsSubmitting(false);
        return;
      }

      // Step 1: Create user profile on blockchain
      const createProfileTxHash = await writeContractAsync({
        abi: resepverseABI,
        address: RECIPE_BOOK_ADDRESS as `0x${string}`,
        functionName: 'createUserProfile',
        args: [],
      } as any);

      // Wait for transaction confirmation
      const createProfileReceipt = await publicClient.waitForTransactionReceipt({ 
        hash: createProfileTxHash 
      });

      // Check if the transaction was successful
      if (createProfileReceipt.status !== 'success') {
        throw new Error('Profile creation transaction failed');
      }

      // Step 2: Complete onboarding
      const onboardingTxHash = await writeContractAsync({
        abi: resepverseABI,
        address: RECIPE_BOOK_ADDRESS as `0x${string}`,
        functionName: 'completeOnboarding',
        args: [],
      } as any);

      // Wait for onboarding transaction confirmation
      const onboardingReceipt = await publicClient.waitForTransactionReceipt({ 
        hash: onboardingTxHash 
      });

      // Check if the onboarding transaction was successful
      if (onboardingReceipt.status !== 'success') {
        throw new Error('Onboarding transaction failed');
      }

      // Add chef as a recipe creator to the store so they can be searched
      const newChefRecipe = {
        title: `${formData.specialties} Specialties by ${formData.name}`,
        ingredients: ['Professional chef specialties', 'Years of experience: ' + formData.experience],
        instructions: [formData.bio, 'Contact: ' + formData.email],
        imageURL: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        description: formData.bio
      };

      await addRecipe(newChefRecipe, account, chain);

      // Show success alert with blockchain details
      await Swal.fire({
        title: '🎉 Welcome to ResepVerse!',
        html: `
          <div class="text-center">
            <div class="text-6xl mb-4">👨‍🍳</div>
            <p class="text-lg mb-2">Chef ${formData.name || 'Profile'} created successfully!</p>
            <p class="text-sm text-gray-400 mb-2">Profile Transaction: ${createProfileTxHash.slice(0, 10)}...${createProfileTxHash.slice(-8)}</p>
            <p class="text-sm text-gray-400 mb-2">Onboarding Transaction: ${onboardingTxHash.slice(0, 10)}...${onboardingTxHash.slice(-8)}</p>
            <p class="text-sm text-gray-400">Your chef profile is now on the blockchain!</p>
          </div>
        `,
        icon: 'success',
        background: '#1f2937',
        color: '#ffffff',
        confirmButtonColor: '#f97316',
        confirmButtonText: '🚀 Start Cooking!',
        showClass: {
          popup: 'animate__animated animate__fadeInUp'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutDown'
        }
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        experience: '',
        specialties: '',
        bio: '',
        portfolio: ''
      });

    } catch (error: any) {
      console.error('Chef registration error:', error);
      
      let errorMessage = 'There was an error creating your chef profile. Please try again.';
      
      // Handle specific error types
      if (error.message?.includes('User rejected') || error.message?.includes('rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (error.message?.includes('User profile does not exist')) {
        errorMessage = 'User profile validation failed. Please try again.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds to complete the transaction.';
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('gas')) {
        errorMessage = 'Transaction failed due to gas issues. Please try again with higher gas limit.';
      } else if (error.message?.includes('execution reverted')) {
        // Handle contract revert errors
        if (error.reason) {
          errorMessage = `Contract error: ${error.reason}`;
        } else {
          errorMessage = 'Contract execution failed. Please try again.';
        }
      }
      
      // Show error alert
      await Swal.fire({
        title: '❌ Registration Failed',
        text: errorMessage,
        icon: 'error',
        background: '#1f2937',
        color: '#ffffff',
        confirmButtonColor: '#f97316',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: <Star className="w-6 h-6" />,
      title: "Earn $LSK Tokens",
      description: "Get rewarded for every recipe shared and cooking session completed",
      color: "bg-orange-500"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Audience",
      description: "Reach food enthusiasts from around the world",
      color: "bg-orange-600"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Build Your Reputation",
      description: "Grow your culinary brand and establish yourself as an expert",
      color: "bg-orange-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Flexible Schedule",
      description: "Host live cooking sessions at your convenience",
      color: "bg-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Simple animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <Header />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="relative group">
            <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl transform transition-all duration-500 group-hover:scale-110">
              <ChefHat className="w-12 h-12 text-white drop-shadow-lg" />
              <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            </div>
            <Sparkles className="absolute top-0 right-1/3 w-6 h-6 text-orange-400 animate-bounce delay-300" />
            <Sparkles className="absolute bottom-0 left-1/3 w-4 h-4 text-orange-400 animate-bounce delay-700" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-orange-400">
            Become a Chef on ResepVerse
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Share your culinary expertise, earn tokens, and build your cooking empire in the
            <span className="text-orange-400 font-semibold"> blockchain kitchen</span>
          </p>
          <div className="flex justify-center space-x-2 mb-8">
            <Badge className="bg-orange-500 text-white px-4 py-2 text-sm">
              🔥 Hot Opportunity
            </Badge>
            <Badge className="bg-orange-600 text-white px-4 py-2 text-sm">
              💰 High Earnings
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Benefits Section */}
          <div className="space-y-8">
            <div className="animate-slide-in-left">
              <h2 className="text-3xl font-bold mb-8 text-orange-400">
                Why Join as a Chef?
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <Card
                    key={index}
                    className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-orange-500/50 transition-all duration-500 hover:scale-105 animate-fade-in-up"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-xl ${benefit.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {benefit.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2 text-white group-hover:text-orange-400 transition-colors duration-300">
                            {benefit.title}
                          </h3>
                          <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <Card className="bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm animate-fade-in-up delay-1000">
              <CardContent className="p-8">
                <h3 className="font-bold text-xl mb-6 text-center text-orange-400">
                  Platform Statistics
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center group">
                    <div className="text-3xl font-bold text-orange-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                      2.5K+
                    </div>
                    <div className="text-sm text-gray-400">Active Chefs</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-bold text-orange-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                      15K+
                    </div>
                    <div className="text-sm text-gray-400">Recipes Shared</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-bold text-orange-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                      $50K
                    </div>
                    <div className="text-sm text-gray-400">Tokens Earned</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-bold text-orange-400 mb-1 group-hover:scale-110 transition-transform duration-300">
                      4.8★
                    </div>
                    <div className="text-sm text-gray-400">Avg Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 animate-slide-in-right">
            <CardHeader className="pb-6">
              <CardTitle className="text-3xl text-orange-400">
                Chef Application
              </CardTitle>
              <p className="text-gray-400 text-lg">Fill out this form to start your culinary journey</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <Label htmlFor="name" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="group">
                    <Label htmlFor="email" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="chef@example.com"
                      className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <Label htmlFor="phone" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                    />
                  </div>
                  <div className="group">
                    <Label htmlFor="experience" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                      Years of Experience *
                    </Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="5"
                      className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <Label htmlFor="specialties" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                    Culinary Specialties *
                  </Label>
                  <Input
                    id="specialties"
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleInputChange}
                    placeholder="Italian, French, Asian Fusion..."
                    className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                    required
                  />
                </div>

                <div className="group">
                  <Label htmlFor="bio" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                    Professional Bio *
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about your culinary background, achievements, and what makes your cooking unique..."
                    rows={4}
                    className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300 resize-none"
                    required
                  />
                </div>

                <div className="group">
                  <Label htmlFor="portfolio" className="text-white group-focus-within:text-orange-400 transition-colors duration-300">
                    Portfolio/Social Media Links
                  </Label>
                  <Textarea
                    id="portfolio"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    placeholder="Share links to your Instagram, YouTube, website, or other platforms showcasing your work..."
                    rows={3}
                    className="bg-gray-800/50 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300 resize-none"
                  />
                </div>

                <Separator className="bg-gray-700" />

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-3 text-orange-400">
                    What happens next?
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Your profile will be created on the blockchain</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Complete onboarding process automatically</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Start creating recipes and earning $LSK tokens</span>
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <ChefHat className="w-5 h-5 mr-2" />
                      Create Chef Profile
                      <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BecomeChef;