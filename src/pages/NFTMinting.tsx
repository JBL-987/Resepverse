
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Upload, Star, Clock, Coins, Award, Image, FileText } from 'lucide-react';
import Header from '@/components/Header';

const NFTMinting = () => {
  const [mintData, setMintData] = useState({
    title: '',
    description: '',
    category: '',
    cookTime: '',
    difficulty: '',
    price: '0.1',
    royalty: '5',
    ingredients: '',
    instructions: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setMintData({
      ...mintData,
      [e.target.name]: e.target.value
    });
  };

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Minting NFT Recipe:', mintData);
    // Here would be the smart contract integration
  };

  const categories = [
    'Italian', 'Asian', 'Mexican', 'French', 'Indian', 'Mediterranean', 
    'American', 'Japanese', 'Thai', 'Chinese', 'Korean', 'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Mint Your Recipe as NFT</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your culinary creations into unique digital assets and earn royalties forever
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Minting Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Coins className="w-6 h-6 mr-2 text-primary" />
                  Create Recipe NFT
                </CardTitle>
                <p className="text-muted-foreground">Fill in the details to mint your recipe as an NFT</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMint} className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recipe Information</h3>
                    
                    <div>
                      <Label htmlFor="title">Recipe Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        value={mintData.title}
                        onChange={handleInputChange}
                        placeholder="Enter your recipe title"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <select
                          id="category"
                          name="category"
                          value={mintData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="cookTime">Cook Time (minutes) *</Label>
                        <Input
                          id="cookTime"
                          name="cookTime"
                          type="number"
                          value={mintData.cookTime}
                          onChange={handleInputChange}
                          placeholder="30"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="difficulty">Difficulty *</Label>
                        <select
                          id="difficulty"
                          name="difficulty"
                          value={mintData.difficulty}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          required
                        >
                          <option value="">Select difficulty</option>
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Recipe Description *</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={mintData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your recipe, its origins, and what makes it special..."
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Recipe Content */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recipe Content</h3>
                    
                    <div>
                      <Label htmlFor="ingredients">Ingredients *</Label>
                      <Textarea
                        id="ingredients"
                        name="ingredients"
                        value={mintData.ingredients}
                        onChange={handleInputChange}
                        placeholder="List all ingredients with quantities (one per line)..."
                        rows={5}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructions">Cooking Instructions *</Label>
                      <Textarea
                        id="instructions"
                        name="instructions"
                        value={mintData.instructions}
                        onChange={handleInputChange}
                        placeholder="Step-by-step cooking instructions..."
                        rows={6}
                        required
                      />
                    </div>

                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">Upload Recipe Images</p>
                      <p className="text-sm text-muted-foreground">Drag and drop or click to upload high-quality images of your dish</p>
                      <Button variant="outline" className="mt-4">
                        <Image className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* NFT Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">NFT Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Mint Price ($LSK) *</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          value={mintData.price}
                          onChange={handleInputChange}
                          placeholder="0.1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="royalty">Royalty Percentage (%) *</Label>
                        <Input
                          id="royalty"
                          name="royalty"
                          type="number"
                          min="0"
                          max="20"
                          value={mintData.royalty}
                          onChange={handleInputChange}
                          placeholder="5"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          You'll earn {mintData.royalty}% from future sales
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Cost Breakdown */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Minting Cost Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Minting Fee:</span>
                        <span>{mintData.price} $LSK</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee (2.5%):</span>
                        <span>{(parseFloat(mintData.price || '0') * 0.025).toFixed(3)} $LSK</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gas Fee (estimated):</span>
                        <span>0.001 $LSK</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total Cost:</span>
                        <span>{(parseFloat(mintData.price || '0') * 1.025 + 0.001).toFixed(3)} $LSK</span>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg">
                    <Award className="w-4 h-4 mr-2" />
                    Mint Recipe NFT
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Selling NFTs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔥 Top Selling Recipe NFTs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Minting Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p>High-quality photos increase NFT value by up to 300%</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p>Detailed instructions make your recipe more valuable</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Unique family recipes sell better than common ones</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Coins className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p>Set competitive prices - check similar recipes first</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMinting;
