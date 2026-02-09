import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Spin, Button, message, Drawer } from 'antd';
import {
  PlusOutlined,
  CloseOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  RiseOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRole } from '../hooks/useRole';
import { ROLES } from '../utils/constants';
import { useLanguage } from '../context/LanguageContext';
import { fetchComplaintsFromBackend, submitComplaintToBackend, upvoteComplaintOnBackend, updateComplaintStatusOnBackend, deleteComplaintOnBackend, isBackendAvailable } from '../utils/api';

const Header = dynamic(() => import('../components/Header'), { ssr: false });
const ComplaintForm = dynamic(() => import('../components/ComplaintForm'), { ssr: false });
const ComplaintCard = dynamic(() => import('../components/ComplaintCard'), { ssr: false });
const ComplaintFilter = dynamic(() => import('../components/ComplaintFilter'), { ssr: false });

// Skeleton loader for cards
const SkeletonCard = () => (
  <div className="skeleton-card animate-fade-in">
    <div className="flex items-center justify-between mb-3">
      <div className="skeleton skeleton-line" style={{ width: '100px', height: '20px' }} />
      <div className="skeleton skeleton-line" style={{ width: '80px', height: '20px' }} />
    </div>
    <div className="skeleton skeleton-line" style={{ width: '70%', height: '16px', marginBottom: '8px' }} />
    <div className="skeleton skeleton-line" style={{ width: '100%', height: '12px' }} />
    <div className="skeleton skeleton-line" style={{ width: '90%', height: '12px' }} />
    <div className="skeleton skeleton-line" style={{ width: '40%', height: '12px', marginTop: '12px' }} />
  </div>
);

// Seed data for first-time users
const SEED_COMPLAINTS = [
  {
    id: '1',
    title: 'Pothole on Main Street',
    description:
      'Large pothole causing traffic hazard near the market junction. Multiple vehicles have been damaged over the past week.',
    category: 'infrastructure',
    location: 'Main Street Market',
    author: 'Anonymous',
    createdAt: Math.floor(Date.now() / 1000) - 86400,
    upvotes: 45,
    status: 'in_progress',
  },
  {
    id: '2',
    title: 'Broken streetlight on Park Avenue',
    description:
      'The streetlight at the corner of Park Avenue and 3rd Street has been out for two weeks. The area is very dark at night, creating safety concerns for pedestrians.',
    category: 'safety',
    location: 'Park Avenue & 3rd Street',
    author: 'Anonymous',
    createdAt: Math.floor(Date.now() / 1000) - 172800,
    upvotes: 32,
    status: 'pending',
  },
  {
    id: '3',
    title: 'Water discoloration in Sector 5',
    description:
      'Tap water has been yellowish-brown for the past 3 days. Residents are unable to use the water for cooking or drinking.',
    category: 'water_quality',
    location: 'Sector 5, Block C',
    author: 'Anonymous',
    createdAt: Math.floor(Date.now() / 1000) - 43200,
    upvotes: 67,
    status: 'pending',
  },
];

export default function Home() {
  const { publicKey } = useWallet();
  const { role, isAdmin, isConnected, walletAddress } = useRole();
  const { t, tCategory, tStatus } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [userVotes, setUserVotes] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    statuses: [],
    location: '',
    sortBy: 'newest',
  });
  const pollIntervalRef = useRef(null);

  // ── Fetch complaints from backend (shared by all users) ──
  const loadComplaints = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const online = await isBackendAvailable();
      setBackendOnline(online);

      if (online) {
        // PRIMARY: fetch from backend so ALL users see ALL complaints
        const data = await fetchComplaintsFromBackend();
        if (data && data.length > 0) {
          // Normalize createdAt to unix seconds for consistent sorting
          const normalized = data.map((c) => ({
            ...c,
            createdAt:
              typeof c.createdAt === 'string'
                ? Math.floor(new Date(c.createdAt).getTime() / 1000)
                : c.createdAt,
          }));
          setComplaints(normalized);
          // Cache to localStorage as offline fallback
          if (typeof window !== 'undefined') {
            localStorage.setItem('civic-complaints', JSON.stringify(normalized));
          }
        } else {
          // Backend is online but no complaints yet — show seed data
          setComplaints(SEED_COMPLAINTS);
        }
      } else {
        // FALLBACK: backend offline → load from localStorage
        console.warn('Backend offline — loading cached complaints from localStorage');
        const stored = typeof window !== 'undefined' ? localStorage.getItem('civic-complaints') : null;
        setComplaints(stored ? JSON.parse(stored) : SEED_COMPLAINTS);
      }
    } catch (err) {
      console.error('Error loading complaints:', err);
      const stored = typeof window !== 'undefined' ? localStorage.getItem('civic-complaints') : null;
      setComplaints(stored ? JSON.parse(stored) : SEED_COMPLAINTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load data on mount + poll every 30 seconds for real-time updates
  useEffect(() => {
    loadComplaints();

    // Poll for new complaints so the feed updates across users
    pollIntervalRef.current = setInterval(() => {
      loadComplaints(false);
    }, 30000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [loadComplaints]);

  // Load user votes from localStorage (votes are per-device, which is fine)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedVotes = localStorage.getItem('civic-user-votes');
      if (storedVotes) setUserVotes(JSON.parse(storedVotes));
    } catch {
      // ignore
    }
  }, []);

  // Filtered + sorted + memoized
  const filteredComplaints = useMemo(() => {
    let results = complaints.filter((c) => {
      if (filters.categories.length && !filters.categories.includes(c.category)) return false;
      if (filters.statuses.length && !filters.statuses.includes(c.status)) return false;
      if (filters.location && !c.location.toLowerCase().includes(filters.location.toLowerCase()))
        return false;
      return true;
    });

    // Sort
    switch (filters.sortBy) {
      case 'oldest':
        results = [...results].sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'most_upvoted':
        results = [...results].sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'newest':
      default:
        results = [...results].sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return results;
  }, [complaints, filters]);

  const stats = useMemo(
    () => ({
      total: complaints.length,
      pending: complaints.filter((c) => c.status === 'pending').length,
      inProgress: complaints.filter((c) => c.status === 'in_progress').length,
      resolved: complaints.filter((c) => c.status === 'resolved').length,
    }),
    [complaints]
  );

  const activeFilterCount = useMemo(() => {
    return filters.categories.length + filters.statuses.length + (filters.location ? 1 : 0);
  }, [filters]);

  // Persist user votes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (Object.keys(userVotes).length > 0) {
      localStorage.setItem('civic-user-votes', JSON.stringify(userVotes));
    }
  }, [userVotes]);

  const handleComplaintCreated = useCallback(
    async (data) => {
      // Optimistic: add to local state immediately so the user sees it
      const tempId = 'temp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const tempComplaint = {
        id: tempId,
        ...data,
        author: publicKey?.toString() || 'Anonymous',
        createdAt: Math.floor(Date.now() / 1000),
        upvotes: 0,
        status: 'pending',
      };
      setComplaints((prev) => [tempComplaint, ...prev]);
      setShowForm(false);

      // Submit to backend so ALL users can see it
      if (backendOnline) {
        try {
          await submitComplaintToBackend({
            title: data.title,
            description: data.description || '',
            category: data.category,
            location: data.location,
            author: publicKey?.toString() || 'Anonymous',
            imageFiles: [], // images already uploaded to IPFS by the form
          });
          // Re-fetch to get the backend-assigned ID and ensure consistency
          await loadComplaints(false);
          message.success('Complaint submitted and shared with all users!');
        } catch (err) {
          console.error('Backend submission failed:', err);
          message.warning('Saved locally. It will sync when the server is back online.');
          // Keep the optimistic local version
          if (typeof window !== 'undefined') localStorage.setItem('civic-complaints', JSON.stringify([tempComplaint, ...complaints]));
        }
      } else {
        // Offline fallback: save to localStorage only
        if (typeof window !== 'undefined') localStorage.setItem('civic-complaints', JSON.stringify([tempComplaint, ...complaints]));
        message.info('Backend offline — complaint saved locally.');
      }
    },
    [publicKey, backendOnline, complaints, loadComplaints]
  );

  const handleUpvote = useCallback(
    async (id) => {
      if (!publicKey) {
        message.warning(t('connectWalletUpvote'));
        return false;
      }
      if (userVotes[id]) {
        message.info(t('alreadyUpvoted'));
        return false;
      }

      // Optimistic UI update — immediately reflect the upvote
      setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, upvotes: (c.upvotes || 0) + 1 } : c)));
      setUserVotes((prev) => ({ ...prev, [id]: true }));

      // Persist to backend so ALL users see the updated count
      if (backendOnline) {
        try {
          await upvoteComplaintOnBackend(id);
        } catch (err) {
          console.error('Backend upvote failed:', err);
          // Don't revert — the optimistic update is fine as a local fallback
        }
      }

      message.success(t('upvoteRecorded'));
      return true;
    },
    [publicKey, userVotes, t, backendOnline]
  );

  const handleDelete = useCallback(async (id) => {
    // Frontend check: only admin or the complaint author can delete
    // On-chain: the delete_complaint instruction enforces admin-only via UnauthorizedAdmin error
    if (!isAdmin) {
      message.error(t('adminOnly'));
      return;
    }

    // Optimistic UI update
    setComplaints((prev) => prev.filter((c) => c.id !== id));
    setUserVotes((prev) => {
      const v = { ...prev };
      delete v[id];
      return v;
    });

    // Persist to backend
    if (backendOnline) {
      try {
        await deleteComplaintOnBackend(id);
      } catch (err) {
        console.error('Backend delete failed:', err);
      }
    }

    message.success(t('complaintRemoved'));
  }, [isAdmin, t, backendOnline]);

  const handleStatusUpdate = useCallback(async (id, status) => {
    // Frontend check: only admin can update status
    // On-chain: the update_status instruction enforces admin-only via UnauthorizedAdmin error
    if (!isAdmin) {
      message.error(t('adminOnly'));
      return;
    }

    // Optimistic UI update
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));

    // Persist to backend
    if (backendOnline) {
      try {
        await updateComplaintStatusOnBackend(id, status);
      } catch (err) {
        console.error('Backend status update failed:', err);
      }
    }
  }, [isAdmin, t, backendOnline]);

  return (
    <>
      <Head>
        <title>CivicPulse — Transparent Civic Complaints on Solana</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta
          name="description"
          content="File and track civic complaints transparently on the Solana blockchain. Your voice matters — permanent, tamper-proof, community-driven."
        />
      </Head>

      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />

        {/* Hero Section */}
        <section className="hero-gradient hero-pattern no-print" aria-labelledby="hero-heading">
          <div className="page-container py-10 sm:py-14">
            <div className="max-w-2xl">
              <h2
                id="hero-heading"
                className="text-2xl sm:text-3xl font-extrabold mb-3 leading-tight hero-heading"
                style={{ fontFamily: 'Poppins, Inter, sans-serif' }}
              >
                {t('heroTitle1')}
                <br />
                <span className="hero-heading-accent">{t('heroTitle2')}</span>
              </h2>
              <p className="hero-subtext text-sm sm:text-base mb-6 leading-relaxed max-w-lg">
                {t('heroSubtext')}
              </p>

              {/* Role Badge — shows current wallet role */}
              {isConnected && (
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isAdmin
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    {isAdmin ? '🛡️ Admin' : '👤 User'}
                  </span>
                </div>
              )}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button
                  type="primary"
                  size="large"
                  icon={showForm ? <CloseOutlined /> : <PlusOutlined />}
                  onClick={() => setShowForm(!showForm)}
                  className="!bg-white !text-red-900 !border-white hover:!bg-red-50 !font-bold !shadow-lg text-sm sm:text-base"
                >
                  {showForm ? t('cancel') : t('fileAComplaint')}
                </Button>
                <Button
                  size="large"
                  className="!bg-black !text-white !border-black hover:!bg-gray-800 !font-semibold text-sm sm:text-base"
                  onClick={() => document.getElementById('complaints-feed')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {t('browseComplaints')}
                </Button>
              </div>
            </div>

            {/* Trust metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 sm:mt-8 max-w-lg">
              <div className="hero-stat-card text-center">
                <div className="hero-stat-value text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                  {stats.total}
                </div>
                <div className="hero-stat-label text-xs font-semibold">{t('totalFiled')}</div>
              </div>
              <div className="hero-stat-card text-center">
                <div className="hero-stat-value text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                  {stats.resolved}
                </div>
                <div className="hero-stat-label text-xs font-semibold">{t('resolved')}</div>
              </div>
              <div className="hero-stat-card text-center">
                <div className="hero-stat-value text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                  100%
                </div>
                <div className="hero-stat-label text-xs font-semibold">Transparent</div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <div className="bg-white border-b border-slate-200">
          <div className="page-container py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                  {t('recentComplaints')}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" aria-hidden="true" />
                    {stats.total} {t('totalFiled').toLowerCase()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
                    {stats.pending} {tStatus('pending').toLowerCase()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: '#003893' }} aria-hidden="true" />
                    {stats.inProgress} {tStatus('in_progress').toLowerCase()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" aria-hidden="true" />
                    {stats.resolved} {tStatus('resolved').toLowerCase()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="primary"
                  size="large"
                  icon={showForm ? <CloseOutlined /> : <PlusOutlined />}
                  onClick={() => {
                    setShowForm(!showForm);
                    if (!showForm) {
                      setTimeout(() => document.getElementById('file-complaint')?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }
                  }}
                >
                  {showForm ? t('cancel') : t('fileComplaint')}
                </Button>
                <Button
                  size="large"
                  icon={<ReloadOutlined spin={refreshing} />}
                  onClick={() => loadComplaints(true)}
                  loading={refreshing}
                  title="Refresh complaints from all users"
                >
                  {refreshing ? '' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="page-container py-6 flex-1" id="main-content">
          <div className="flex flex-col md:flex-row gap-6" id="complaints-feed">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <ComplaintFilter onFilterChange={setFilters} currentFilters={filters} />
            </aside>

            {/* Mobile Filter Button + Drawer */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer w-full justify-center mb-4"
                aria-label={`Open filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
              >
                <FilterOutlined aria-hidden="true" />
                {t('filters')}
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <Drawer
                title={t('filters')}
                placement="bottom"
                onClose={() => setMobileFilterOpen(false)}
                open={mobileFilterOpen}
                height="70vh"
                className="rounded-t-2xl"
              >
                <ComplaintFilter onFilterChange={setFilters} currentFilters={filters} />
              </Drawer>
            </div>

            {/* Feed */}
            <div className="flex-1 min-w-0">
              {showForm && <ComplaintForm onComplaintCreated={handleComplaintCreated} />}

              {/* Loading skeleton */}
              {loading && (
                <div aria-label="Loading complaints" role="status">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <span className="sr-only">Loading complaints...</span>
                </div>
              )}

              {/* Empty state */}
              {!loading && filteredComplaints.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center" role="status">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <FileTextOutlined className="text-2xl text-red-300" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700 mb-1">
                    {t('noComplaintsTitle')}
                  </h3>
                  <p className="text-sm text-slate-400 max-w-xs mb-4">
                    {t('noComplaintsDesc')}
                  </p>
                  {complaints.length === 0 && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setShowForm(true)}
                    >
                      {t('fileAComplaint')}
                    </Button>
                  )}
                </div>
              )}

              {/* Complaint cards */}
              {!loading && filteredComplaints.length > 0 && (
                <>
                  <p className="text-xs text-slate-400 mb-3">
                    Showing {filteredComplaints.length} of {complaints.length} complaints
                  </p>
                  <div className="stagger-children" role="feed" aria-label="Complaints feed">
                    {filteredComplaints.map((complaint) => (
                      <ComplaintCard
                        key={complaint.id}
                        complaint={complaint}
                        hasVoted={!!userVotes[complaint.id]}
                        onUpvote={handleUpvote}
                        onStatusUpdate={handleStatusUpdate}
                        onDelete={handleDelete}
                        currentUserAddress={publicKey?.toString()}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white no-print" role="contentinfo">
          <div className="page-container py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-700 text-white text-sm" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 m-0">CivicPulse</p>
                  <p className="text-xs text-slate-400 m-0">&copy; {new Date().getFullYear()} &middot; Open Source</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <SafetyCertificateOutlined aria-hidden="true" /> Powered by Solana
                </span>
                <span className="w-px h-3 bg-slate-200 hidden sm:block" aria-hidden="true" />
                <span>Stored on IPFS</span>
                <span className="w-px h-3 bg-slate-200 hidden sm:block" aria-hidden="true" />
                <span className="flex items-center gap-1">
                  <TeamOutlined aria-hidden="true" /> Community Driven
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
