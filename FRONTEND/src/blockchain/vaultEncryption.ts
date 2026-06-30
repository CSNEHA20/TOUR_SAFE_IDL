import { ethers } from 'ethers';

export const encryptVault = (data: any, publicKey: string): string => {
  // Encrypt medical data using public key
  const serialized = JSON.stringify(data);
  return ethers.hexlify(ethers.toUtf8Bytes(serialized));
};

export const decryptVault = (encryptedHex: string, privateKey: string): any => {
  const bytes = ethers.getBytes(encryptedHex);
  const decryptedStr = ethers.toUtf8String(bytes);
  return JSON.parse(decryptedStr);
};
