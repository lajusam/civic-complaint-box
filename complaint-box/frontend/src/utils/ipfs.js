// IPFS utility functions
// Handles uploading complaint text and images to IPFS via Pinata

import axios from 'axios';
import { IPFS_GATEWAY, IPFS_API_KEY, IPFS_API_SECRET } from './constants';

const PINATA_ENDPOINT = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

/**
 * Check if Pinata credentials are configured
 */
const hasValidCredentials = () => {
  if (!IPFS_API_KEY || !IPFS_API_SECRET) return false;
  const placeholders = ['demo_key', 'demo_secret', 'test_key_replace_with_real', 'test_secret_replace_with_real', 'your_api_key', 'your_api_secret', ''];
  return !placeholders.includes(IPFS_API_KEY) && !placeholders.includes(IPFS_API_SECRET);
};

/**
 * Upload complaint data to IPFS
 * @param {Object} complaintData - Complaint details (text, images, etc.)
 * @returns {Promise<string>} IPFS hash or mock hash for demo
 */
export const uploadComplaintToIPFS = async (complaintData) => {
  try {
    // Return mock hash if credentials not configured (for development)
    if (!hasValidCredentials()) {
      console.warn('IPFS credentials not configured, using mock hash for demo');
      return `QmDemo${Math.random().toString(36).substring(7)}`;
    }

    // Create FormData for file upload
    const formData = new FormData();
    
    // Add complaint data as JSON blob
    const jsonBlob = new Blob([JSON.stringify(complaintData)], { type: 'application/json' });
    formData.append('file', jsonBlob, 'complaint.json');

    // Add metadata
    const metadata = {
      name: `Complaint-${Date.now()}`,
      keyvalues: {
        type: 'civic-complaint',
        category: complaintData.category,
        location: complaintData.location,
      },
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    // Request options with Pinata credentials
    const config = {
      headers: {
        pinata_api_key: IPFS_API_KEY,
        pinata_secret_api_key: IPFS_API_SECRET,
      },
    };

    const response = await axios.post(PINATA_ENDPOINT, formData, config);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    // Return mock hash on error for demo purposes
    return `QmError${Math.random().toString(36).substring(7)}`;
  }
};

/**
 * Retrieve complaint data from IPFS
 * @param {string} ipfsHash - IPFS hash
 * @returns {Promise<Object>} Complaint data or mock data for demo
 */
export const getComplaintFromIPFS = async (ipfsHash) => {
  try {
    // Return mock data if hash is demo hash
    if (ipfsHash.startsWith('QmDemo') || ipfsHash.startsWith('QmError')) {
      return {
        title: 'Mock Complaint',
        description: 'This is a mock complaint for demonstration',
        category: 'other',
        location: 'Demo Location',
      };
    }

    const url = `${IPFS_GATEWAY}${ipfsHash}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    // Return mock data on error
    return {
      title: 'Error Loading Complaint',
      description: 'Could not load complaint data',
      category: 'other',
      location: 'Unknown',
    };
  }
};

/**
 * Upload image file to IPFS and get hash
 * @param {File} imageFile - Image file to upload
 * @returns {Promise<string>} IPFS hash or mock hash for demo
 */
export const uploadImageToIPFS = async (imageFile) => {
  try {
    // Return mock hash if credentials not configured or are placeholder values
    if (!hasValidCredentials()) {
      console.warn('IPFS credentials not configured, using local preview for demo');
      return `QmImage${Date.now().toString(36)}${Math.random().toString(36).substring(7)}`;
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    const metadata = {
      name: imageFile.name,
      keyvalues: {
        type: 'complaint-image',
      },
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    const config = {
      headers: {
        pinata_api_key: IPFS_API_KEY,
        pinata_secret_api_key: IPFS_API_SECRET,
      },
      timeout: 30000,
    };

    const response = await axios.post(PINATA_ENDPOINT, formData, config);
    return response.data.IpfsHash;
  } catch (error) {
    console.warn('IPFS upload failed, using local preview:', error.message);
    // Return mock hash on error — image will still show via local blob URL
    return `QmImage${Date.now().toString(36)}${Math.random().toString(36).substring(7)}`;
  }
};
