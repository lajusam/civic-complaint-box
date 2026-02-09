/**
 * Backend API utility for Civic Complaint Box
 *
 * Works with BOTH:
 *   1. The built-in Next.js API route (/api/complaints) on Vercel  — JSON body
 *   2. The standalone Express backend (localhost:5000)              — FormData body
 *
 * Detection: if BACKEND_API_URL is empty (default on Vercel), we use
 * the same-origin /api path and send JSON.  Otherwise we send FormData
 * to the external Express server.
 */

import axios from 'axios';
import { BACKEND_API_URL } from './constants';

// When BACKEND_API_URL is empty, API_BASE becomes '/api' (relative → same-origin)
const API_BASE = BACKEND_API_URL ? `${BACKEND_API_URL}/api` : '/api';

// True when using the built-in Next.js API route (no external backend)
const isBuiltInApi = !BACKEND_API_URL;

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
  try {
    let response;

    if (isBuiltInApi) {
      // ── Built-in Next.js API route: send JSON ──
      response = await axios.post(`${API_BASE}/complaints`, {
        title,
        description: description || '',
        category,
        location,
        author: author || 'Anonymous',
        imageUrls: [],
      }, {
        timeout: 15000,
      });
    } else {
      // ── External Express backend: send FormData for file uploads ──
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description || '');
      formData.append('category', category);
      formData.append('location', location);
      formData.append('author', author || 'Anonymous');

      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => formData.append('images', file));
      }

      response = await axios.post(`${API_BASE}/complaints`, formData, {
        timeout: 60000,
      });
    }

    return response.data;
  } catch (error) {
    const serverMsg = error.response?.data?.error;
    const status = error.response?.status;

    if (status === 400) throw new Error(serverMsg || 'Invalid complaint data. Please check your inputs.');
    if (status === 413) throw new Error('Image file is too large. Maximum size is 5MB.');
    if (error.code === 'ECONNREFUSED') throw new Error('Cannot connect to backend server. Is it running?');
    if (error.code === 'ECONNABORTED') throw new Error('Upload timed out. Please try with a smaller image.');

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
