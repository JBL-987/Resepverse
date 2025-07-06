
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChefHat, Star, Clock, Users, Award, Camera } from 'lucide-react';
import Header from '@/components/Header';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Chef application submitted:', formData);
    // Here would be the actual submission logic
  };

  const benefits = [
    {
      icon: <Star className="w-6 h-6" />,
      title: "Earn $LSK Tokens",
      description: "Get rewarded for every recipe shared and cooking session completed"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Global Audience",
      description: "Reach food enthusiasts from around the world"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Build Your Reputation",
      description: "Grow your culinary brand and establish yourself as an expert"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Flexible Schedule",
      description: "Host live cooking sessions at your convenience"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Become a Chef on ResepVerse</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Share your culinary expertise, earn tokens, and build your cooking empire in the blockchain kitchen
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Benefits Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Why Join as a Chef?</h2>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="text-primary">{benefit.icon}</div>
                        <div>
                          <h3 className="font-semibold mb-2">{benefit.title}</h3>
                          <p className="text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <Card className="bg-gradient-to-r from-primary/10 to-orange-400/10">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Platform Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">2.5K+</div>
                    <div className="text-sm text-muted-foreground">Active Chefs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">15K+</div>
                    <div className="text-sm text-muted-foreground">Recipes Shared</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">$50K</div>
                    <div className="text-sm text-muted-foreground">Tokens Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">4.8★</div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Chef Application</CardTitle>
              <p className="text-muted-foreground">Fill out this form to start your culinary journey</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="chef@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialties">Culinary Specialties *</Label>
                  <Input
                    id="specialties"
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleInputChange}
                    placeholder="Italian, French, Asian Fusion..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about your culinary background, achievements, and what makes your cooking unique..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="portfolio">Portfolio/Social Media Links</Label>
                  <Textarea
                    id="portfolio"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    placeholder="Share links to your Instagram, YouTube, website, or other platforms showcasing your work..."
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">What happens next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Our team will review your application within 3-5 business days</li>
                    <li>• You'll receive an email with next steps and onboarding materials</li>
                    <li>• Complete your chef profile and start earning $LSK tokens</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg">
                  <ChefHat className="w-4 h-4 mr-2" />
                  Submit Application
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
