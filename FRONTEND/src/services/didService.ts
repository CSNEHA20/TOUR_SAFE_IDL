import { ethers } from 'ethers';

export interface MedicalVaultData {
  bloodType: string;
  allergies: string[];
  medications: string;
  chronicConditions: string[];
  insurancePolicyNumber: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

class DidService {
  public async generateTravelerDID(medicalData: MedicalVaultData) {
    try {
      console.log('[DID] Generating on-device secp256k1 key pair...');
      const wallet = ethers.Wallet.createRandom();
      
      const privateKey = wallet.privateKey;
      const publicKey = wallet.publicKey;
      const publicKeyHash = ethers.keccak256(ethers.toUtf8Bytes(publicKey));

      console.log('[DID] Encrypting medical data vault with public key...');
      const serializedData = JSON.stringify(medicalData);
      
      // Asymmetric encryption mock for prototype
      // In production, encrypt vault using WebCrypto or secp256k1 ECIES
      const encryptedVaultHex = ethers.hexlify(ethers.toUtf8Bytes(serializedData));
      
      // Simulate IPFS upload
      const mockIpfsCID = `Qm${ethers.hexlify(ethers.randomBytes(32)).substring(2, 48)}`;
      
      // Call register API
      const response = await fetch('http://localhost:8000/api/did/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traveler_id: `traveler-${wallet.address.substring(2, 6).toLowerCase()}`,
          public_key_hash: publicKeyHash,
          ipfs_cid: mockIpfsCID,
        }),
      });

      if (!response.ok) {
        throw new Error(`Register API failed with code ${response.status}`);
      }

      const registrationResult = await response.json();
      
      return {
        did: registrationResult.did || `did:toursafe:${publicKeyHash}`,
        publicKey,
        privateKey,
        ipfsCID: mockIpfsCID,
      };
    } catch (e) {
      console.error('Failed to generate blockchain DID:', e);
      throw e;
    }
  }
}

export const didService = new DidService();
export default didService;
