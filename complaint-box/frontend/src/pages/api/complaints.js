/**
 * Next.js API Route: /api/complaints
 *
 * Serverless endpoint for complaint CRUD — runs on Vercel automatically.
 * This replaces the need for a separate Express backend in production.
 *
 * STORAGE NOTE:
 *   Currently uses module-level memory (persists only within a warm serverless
 *   instance). For production, replace `complaintsStore` with a real database
 *   (e.g. Azure Cosmos DB, MongoDB Atlas, Supabase, etc.).
 */

// ── In-memory complaint store (shared across warm invocations) ──
// Using `globalThis` ensures the store survives hot-reloads in `next dev`
// and persists within a single warm Vercel function instance.
if (!globalThis.__civicComplaints) {
  globalThis.__civicComplaints = [];
}

function getStore() {
  return globalThis.__civicComplaints;
}

function setStore(data) {
  globalThis.__civicComplaints = data;
}

// ── Unique ID generator ──
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function handler(req, res) {
  // CORS headers so the frontend (any origin during dev) can call this route
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ── GET /api/complaints ──
  if (req.method === 'GET') {
    const complaints = getStore();
    return res.status(200).json({ complaints });
  }

  // ── POST /api/complaints ──
  if (req.method === 'POST') {
    const { title, description, category, location, author, imageUrls } = req.body || {};

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required.' });
    }

    const complaint = {
      id: generateId(),
      title: String(title).trim(),
      description: String(description || '').trim(),
      category: String(category).trim(),
      location: String(location || '').trim(),
      author: String(author || 'Anonymous').trim(),
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      createdAt: Math.floor(Date.now() / 1000),
      upvotes: 0,
      status: 'pending',
    };

    const store = getStore();
    store.unshift(complaint); // newest first
    setStore(store);

    return res.status(201).json(complaint);
  }

  // ── Unsupported methods ──
  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
