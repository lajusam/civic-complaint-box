/**
 * Backend API utility for Civic Complaint Box
 *
 * Sends complaint + image data to the Express backend
 * using FormData (multipart/form-data).
 */

import axios from 'axios';
import { BACKEND_API_URL } from './constants';

const API_BASE = `${BACKEND_API_URL}/api`;

/**
 * Submit a complaint with optional images to the backend.
 *
 * @param {Object} params
 * @param {string} params.title       - Complaint title
 * @param {string} params.description - Complaint description
 * @param {string} params.category    - Category key
 * @param {string} params.location    - Location string
 * @param {string} params.author      - Wallet address or 'Anonymous'
 * @param {File[]} params.imageFiles  - Array of image File objects (can be empty)
 * @returns {Promise<Object>} The created complaint from the server
 */
export const submitComplaintToBackend = async ({
  title,
  description,
  category,
  location,
  author,
  imageFiles = [],
}) => {
  const formData = new FormData();

  // Append text fields
  formData.append('title', title);
  formData.append('description', description);
  formData.append('category', category);
  formData.append('location', location);
  formData.append('author', author || 'Anonymous');

  // Append image files (field name must match backend: 'images')
  if (imageFiles.length > 0) {
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });
  }

  try {
    const response = await axios.post(`${API_BASE}/complaints`, formData, {
      headers: {
        // Let browser set Content-Type with correct boundary for multipart/form-data
        // Do NOT manually set Content-Type — axios/browser will add the boundary
      },
      timeout: 60000, // 60s timeout for large uploads
    });

    return response.data;
  } catch (error) {
    // Extract server-provided error message if available
    const serverMsg = error.response?.data?.error;
    const status = error.response?.status;

    if (status === 400) {
      throw new Error(serverMsg || 'Invalid complaint data. Please check your inputs.');
    }
    if (status === 413) {
      throw new Error('Image file is too large. Maximum size is 5MB.');
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to backend server. Is it running?');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timed out. Please try with a smaller image.');
    }

    throw new Error(serverMsg || 'Failed to submit complaint. Please try again.');
  }
};

/**
 * Fetch all complaints from the backend.
 * @returns {Promise<Object[]>} Array of complaints
 */
export const fetchComplaintsFromBackend = async () => {
  try {
    const response = await axios.get(`${API_BASE}/complaints`, { timeout: 10000 });
    return response.data.complaints || [];
  } catch (error) {
    console.error('Failed to fetch complaints from backend:', error.message);
    return [];
  }
};

/**
 * Check if the backend server is available.
 * @returns {Promise<boolean>}
 */
export const isBackendAvailable = async () => {
  try {
    await axios.get(`${API_BASE}/health`, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
};
