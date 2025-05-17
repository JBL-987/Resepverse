const { ethers } = require('hardhat');

async function main() {
  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();
  console.log('New private key:', wallet.privateKey);
  console.log('New address:', wallet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
