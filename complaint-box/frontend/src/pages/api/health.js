/**
 * Next.js API Route: /api/health
 * Simple health check endpoint for the frontend's isBackendAvailable() check.
 */
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}
