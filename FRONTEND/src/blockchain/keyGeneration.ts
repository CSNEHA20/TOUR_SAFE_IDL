import { ethers } from 'ethers';

export const generateKeyPair = () => {
  // Generate secp256k1 key pair using ethers.js
  const wallet = ethers.Wallet.createRandom();
  return {
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
    address: wallet.address,
  };
};
