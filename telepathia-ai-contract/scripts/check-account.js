require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  // Get the private key from .env
  const privateKey = process.env.PRIVATE_KEY;
  console.log('Private key from .env:', privateKey);
  
  // Create a wallet from the private key
  const wallet = new ethers.Wallet(privateKey);
  console.log('Derived address:', wallet.address);
  
  // Get the current signer from hardhat
  const [signer] = await ethers.getSigners();
  console.log('Hardhat signer address:', signer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
