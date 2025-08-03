import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicClient } from 'wagmi';
import { resepverseABI } from '@/utils/abi';
import { RECIPE_BOOK_ADDRESS } from '@/constants';
import Header from '@/components/Header';

type Chef = {
  name: string;
  bio: string;
  specialties: string;
  reputation?: number;
};

const ChefProfile = () => {
  const { id } = useParams();
  const [chef, setChef] = useState<Chef | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchChefProfile = async () => {
      if (!id) return;
      try {
        const profileFromStorage = localStorage.getItem(`chef_profile_${id}`);
        if (profileFromStorage) {
          setChef(JSON.parse(profileFromStorage) as Chef);
        } else {
          // Fallback to fetching from blockchain if not in local storage
          const chefData = await publicClient.readContract({
            address: RECIPE_BOOK_ADDRESS as `0x${string}`,
            abi: resepverseABI,
            functionName: 'getUserProfile',
            args: [],
          } as any);
          // Note: The blockchain data structure is different.
          // You might want to merge this with off-chain data if available.
          const onChainProfile: Chef = {
            name: 'On-Chain Chef',
            bio: `Reputation: ${(chefData as any).reputation.toString()}`,
            specialties: 'Blockchain',
            reputation: Number((chefData as any).reputation),
          };
          setChef(onChainProfile);
        }
      } catch (error) {
        console.error('Error fetching chef profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChefProfile();
  }, [id, publicClient]);
    if (isLoading) {
    return <div>Loading chef profile...</div>;
  }

  if (!chef) {
    return <div>Chef not found.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
          <h1 className="text-4xl font-bold text-orange-400 mb-4">{chef.name}</h1>
          <p className="text-lg text-gray-400 mb-2">{chef.bio}</p>
          <p className="text-lg text-gray-400">Specialties: {chef.specialties}</p>
        </div>
      </div>
    </div>
  );
};

export default ChefProfile;