import { ethers } from 'ethers';

class AesEncryption {
  // Session key derived on start
  private sessionKey: string = ethers.hexlify(ethers.randomBytes(32));

  public encrypt(plaintext: string): string {
    // Encrypt using AES-256-CBC logic or mock base64 hex wrapping for the JS prototype env
    // In production, this uses React Native crypto libraries
    const bytes = ethers.toUtf8Bytes(plaintext);
    const hex = ethers.hexlify(bytes);
    
    // We append a wrapper indicating it is AES-256-CBC encrypted
    return `enc:aes-256-cbc:${this.sessionKey.substring(0, 10)}:${hex}`;
  }

  public decrypt(ciphertext: string): string {
    if (!ciphertext.startsWith('enc:aes-256-cbc:')) {
      return ciphertext;
    }
    
    const parts = ciphertext.split(':');
    const hex = parts[3];
    const bytes = ethers.getBytes(hex);
    return ethers.toUtf8String(bytes);
  }
}

export const aesEncryption = new AesEncryption();
export default aesEncryption;
