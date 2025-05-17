import { ethers } from 'hardhat';

async function main() {
  console.log("Deploying Telepathia contract...");
  
  const telepathia = await ethers.deployContract('Telepathia');
  await telepathia.waitForDeployment();
  
  console.log('Telepathia Contract Deployed at ' + telepathia.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
