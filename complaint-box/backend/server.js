/**
 * Civic Complaint Box — Backend Server
 *
 * Express server that handles complaint submissions with image uploads.
 * Accepts multipart/form-data via multer, uploads images to IPFS (Pinata),
 * and stores complaint metadata.
 *
 * Endpoints:
 *   POST /api/complaints       — Submit a new complaint with optional image
 *   GET  /api/complaints       — List all complaints
 *   GET  /api/complaints/:id   — Get a single complaint
 *   GET  /api/health           — Health check
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Configuration ────────────────────────────────────────────────────

// Pinata IPFS credentials (set via environment variables)
const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_API_SECRET = process.env.PINATA_API_SECRET || '';
const PINATA_ENDPOINT = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

// File-based complaint store (persists across server restarts)
const DATA_FILE = path.join(__dirname, 'complaints.json');
let complaints = [];

// Load existing complaints from file on startup
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    complaints = JSON.parse(raw);
    console.log(`📂 Loaded ${complaints.length} complaints from ${DATA_FILE}`);
  }
} catch (err) {
  console.error('Failed to load complaints from file:', err.message);
  complaints = [];
}

// Helper: persist complaints to disk
function saveComplaintsToFile() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(complaints, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save complaints to file:', err.message);
  }
}

// ─── Middleware ────────────────────────────────────────────────────────

// CORS — allow frontend origin (supports multiple origins for mobile + desktop)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(s => s.trim());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // In development, allow all localhost origins
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON bodies (for non-file requests)
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Multer Setup (multipart/form-data) ───────────────────────────────

// File filter — only allow jpg, jpeg, png
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only JPG, JPEG, and PNG images are allowed.`), false);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `complaint-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
    files: 5,                   // Max 5 images per complaint
  },
});

// ─── Helper: Upload file to IPFS via Pinata ───────────────────────────

async function uploadToIPFS(filePath, fileName) {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    console.warn('Pinata credentials not configured. Returning mock IPFS hash.');
    return `QmMock${Date.now().toString(36)}${Math.random().toString(36).substring(7)}`;
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath), fileName);

  const metadata = JSON.stringify({
    name: fileName,
    keyvalues: { type: 'complaint-image', uploadedAt: new Date().toISOString() },
  });
  formData.append('pinataMetadata', metadata);

  try {
    const response = await axios.post(PINATA_ENDPOINT, formData, {
      maxBodyLength: Infinity,
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
      timeout: 30000,
    });
    return response.data.IpfsHash;
  } catch (error) {
    console.error('IPFS upload failed:', error.response?.data || error.message);
    throw new Error('Failed to upload to IPFS');
  }
}

async function uploadJSONToIPFS(jsonData) {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    console.warn('Pinata credentials not configured. Returning mock IPFS hash.');
    return `QmMock${Date.now().toString(36)}${Math.random().toString(36).substring(7)}`;
  }

  const formData = new FormData();
  const jsonBuffer = Buffer.from(JSON.stringify(jsonData));
  formData.append('file', jsonBuffer, {
    filename: 'complaint.json',
    contentType: 'application/json',
  });

  const metadata = JSON.stringify({
    name: `Complaint-${Date.now()}`,
    keyvalues: {
      type: 'civic-complaint',
      category: jsonData.category || 'other',
    },
  });
  formData.append('pinataMetadata', metadata);

  try {
    const response = await axios.post(PINATA_ENDPOINT, formData, {
      maxBodyLength: Infinity,
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
      timeout: 30000,
    });
    return response.data.IpfsHash;
  } catch (error) {
    console.error('IPFS JSON upload failed:', error.response?.data || error.message);
    throw new Error('Failed to upload complaint data to IPFS');
  }
}

// ─── Routes ───────────────────────────────────────────────────────────

/**
 * POST /api/complaints
 *
 * Accepts multipart/form-data with:
 *   - title (string, required)
 *   - description (string, required)
 *   - category (string, required)
 *   - location (string, required)
 *   - author (string, optional — wallet address)
 *   - image (file, optional — single image)
 *   - images (files, optional — multiple images, max 5)
 */
app.post('/api/complaints', upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, location, author } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required.' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Category is required.' });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ error: 'Location is required.' });
    }

    // Upload images to IPFS
    const imageHashes = [];
    const imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const ipfsHash = await uploadToIPFS(file.path, file.originalname);
          imageHashes.push(ipfsHash);
          imageUrls.push(`${IPFS_GATEWAY}${ipfsHash}`);
        } catch (uploadErr) {
          console.error(`Failed to upload image ${file.originalname}:`, uploadErr.message);
          // Continue with other images; don't fail the whole request
        } finally {
          // Clean up local file after upload
          fs.unlink(file.path, (err) => {
            if (err) console.warn('Failed to delete temp file:', file.path);
          });
        }
      }
    }

    // Build complaint object
    const complaint = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      author: author || 'Anonymous',
      images: imageHashes,
      imageUrls,
      createdAt: new Date().toISOString(),
      status: 'pending',
      upvotes: 0,
    };

    // Upload full complaint JSON to IPFS
    let ipfsHash = null;
    try {
      ipfsHash = await uploadJSONToIPFS(complaint);
      complaint.ipfsHash = ipfsHash;
    } catch (ipfsErr) {
      console.warn('Failed to upload complaint JSON to IPFS:', ipfsErr.message);
      // Non-fatal — complaint is still saved in-memory
    }

    // Store complaint and persist to file
    complaints.unshift(complaint);
    saveComplaintsToFile();

    console.log(`✅ Complaint created: "${complaint.title}" (ID: ${complaint.id}, Images: ${imageHashes.length})`);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      complaint,
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({
      error: 'Failed to create complaint. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/complaints
 * Returns all complaints, newest first.
 */
app.get('/api/complaints', (req, res) => {
  res.json({
    success: true,
    count: complaints.length,
    complaints,
  });
});

/**
 * GET /api/complaints/:id
 * Returns a single complaint by ID.
 */
app.get('/api/complaints/:id', (req, res) => {
  const complaint = complaints.find((c) => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found.' });
  }
  res.json({ success: true, complaint });
});

/**
 * PATCH /api/complaints
 * Update a complaint (upvote or status change).
 * Query param: ?id=X
 * Body: { action: 'upvote' } or { action: 'status', status: 'resolved' }
 */
app.patch('/api/complaints', (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Complaint id is required as query param.' });
  }

  const index = complaints.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Complaint not found.' });
  }

  const { action, status } = req.body || {};

  if (action === 'upvote') {
    complaints[index].upvotes = (complaints[index].upvotes || 0) + 1;
    saveComplaintsToFile();
    return res.status(200).json({ success: true, complaint: complaints[index] });
  }

  if (action === 'status' && status) {
    const validStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    complaints[index].status = status;
    saveComplaintsToFile();
    return res.status(200).json({ success: true, complaint: complaints[index] });
  }

  return res.status(400).json({ error: 'Invalid action. Use { action: "upvote" } or { action: "status", status: "..." }.' });
});

/**
 * DELETE /api/complaints
 * Delete a complaint by ID.
 * Query param: ?id=X
 */
app.delete('/api/complaints', (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Complaint id is required as query param.' });
  }

  const index = complaints.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Complaint not found.' });
  }

  complaints.splice(index, 1);
  saveComplaintsToFile();
  console.log(`🗑️ Complaint deleted (ID: ${id})`);
  return res.status(200).json({ success: true });
});

/**
 * GET /api/health
 * Health check endpoint.
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    ipfsConfigured: !!(PINATA_API_KEY && PINATA_API_SECRET),
  });
});

// ─── Error Handling ───────────────────────────────────────────────────

// Multer error handler (file size, file type, etc.)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Image file is too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum 5 images per complaint.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: err.message });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Civic Complaint Backend running on http://localhost:${PORT}`);
  console.log(`   POST /api/complaints   — Submit complaint (multipart/form-data)`);
  console.log(`   GET  /api/complaints   — List complaints`);
  console.log(`   GET  /api/health       — Health check`);
  console.log(`   IPFS: ${PINATA_API_KEY ? 'Configured ✅' : 'Not configured (using mock hashes)'}\n`);
});
