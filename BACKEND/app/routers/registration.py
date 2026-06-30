from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class TravelerRegisterInput(BaseModel):
    name: str
    country: str
    kyc_type: str  # AADHAAR or PASSPORT
    kyc_id: str
    blood_type: str
    allergies: list
    emergency_contacts: list

class DIDRegisterInput(BaseModel):
    traveler_id: str
    public_key_hash: str
    ipfs_cid: str

@router.post("/api/register", status_code=status.HTTP_201_CREATED)
async def register_traveler(data: TravelerRegisterInput):
    """
    Registers a new traveler profile.
    """
    logger.info(f"Registering traveler profile: {data.name}")
    return {
        "success": True,
        "message": "Traveler profile registered successfully.",
        "traveler_id": f"traveler-{data.kyc_id[-4:]}"
    }

@router.post("/api/did/register", status_code=status.HTTP_201_CREATED)
async def register_did(data: DIDRegisterInput):
    """
    Anchors DID details (public key hash + IPFS CID) to the profile.
    """
    logger.info(f"Anchoring DID for traveler {data.traveler_id} (IPFS CID: {data.ipfs_cid})")
    return {
        "success": True,
        "message": "Decentralized Identity anchored successfully.",
        "did": f"did:toursafe:{data.public_key_hash}"
    }
