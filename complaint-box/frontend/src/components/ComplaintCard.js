import React, { useState, useMemo, useCallback } from 'react';
import { Button, Modal, Select, message, Popconfirm, Tooltip } from 'antd';
import {
  LikeOutlined,
  LikeFilled,
  EnvironmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DeleteOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  LinkOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { COMPLAINT_STATUS, ADMIN_WALLET, isAdminWallet, IPFS_GATEWAY } from '../utils/constants';
import { useLanguage } from '../context/LanguageContext';

const CATEGORY_META = {
  infrastructure: { icon: '🏗️', color: '#003893', label: 'Infrastructure' },
  safety: { icon: '🛡️', color: '#DC143C', label: 'Safety' },
  water_quality: { icon: '💧', color: '#0ea5e9', label: 'Water Quality' },
  sanitation: { icon: '🧹', color: '#059669', label: 'Sanitation' },
  traffic: { icon: '🚦', color: '#f59e0b', label: 'Traffic' },
  noise_pollution: { icon: '🔊', color: '#7c3aed', label: 'Noise Pollution' },
  other: { icon: '📋', color: '#64748b', label: 'Other' },
};

const STATUS_ORDER = ['pending', 'in_progress', 'resolved'];

const ComplaintCard = ({
  complaint,
  hasVoted,
  onUpvote,
  onStatusUpdate,
  onDelete,
  currentUserAddress,
}) => {
  const { t, tCategory, tStatus } = useLanguage();
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(complaint.status);

  const isAdmin = isAdminWallet(currentUserAddress);
  const isAuthor = currentUserAddress === complaint.author;
  const catMeta = CATEGORY_META[complaint.category] || CATEGORY_META.other;

  const formattedDate = useMemo(() => {
    const date = new Date(complaint.createdAt * 1000);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [complaint.createdAt]);

  const shortAuthor = useMemo(() => {
    if (!complaint.author || complaint.author === 'Anonymous') return 'Anonymous';
    return `${complaint.author.slice(0, 4)}...${complaint.author.slice(-4)}`;
  }, [complaint.author]);

  // Determine status timeline progress
  const statusIndex = useMemo(() => {
    if (complaint.status === 'rejected') return -1;
    return STATUS_ORDER.indexOf(complaint.status);
  }, [complaint.status]);

  const handleUpvote = useCallback(async () => {
    if (isUpvoting || hasVoted) return;
    setIsUpvoting(true);
    try {
      const result = onUpvote(complaint.id);
      // Handle both sync and async onUpvote
      if (result && typeof result.then === 'function') {
        await result;
      }
    } catch (error) {
      console.error('Upvote error:', error);
      message.error('Failed to upvote. Please try again.');
    } finally {
      setIsUpvoting(false);
    }
  }, [onUpvote, complaint.id, isUpvoting, hasVoted]);

  const handleStatusUpdate = useCallback(async () => {
    try {
      await onStatusUpdate(complaint.id, selectedStatus);
      message.success('Status updated successfully');
      setIsStatusModalVisible(false);
    } catch (error) {
      message.error('Failed to update status. Please try again.');
    }
  }, [onStatusUpdate, complaint.id, selectedStatus]);

  return (
    <article
      className="glass-card p-5 mb-4 animate-fade-in-up relative"
      style={{ WebkitTransform: 'translateZ(0)', transform: 'translateZ(0)' }}
      role="article"
      aria-label={`Complaint: ${complaint.title}`}
    >
      {/* Top row: Category + Trust Badges + Status */}
      <div className="flex items-start justify-between mb-3 gap-2 flex-wrap min-w-0 overflow-hidden">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
          <span
            className="category-chip"
            style={{ background: `${catMeta.color}10`, color: catMeta.color, borderColor: `${catMeta.color}30`, border: '1px solid' }}
          >
            <span aria-hidden="true">{catMeta.icon}</span>
            {tCategory(complaint.category)}
          </span>

          {/* Trust indicators */}
          <span className="trust-badge trust-badge-onchain" title="Verified on Solana blockchain">
            <SafetyCertificateOutlined style={{ fontSize: 10 }} aria-hidden="true" />
            On-chain
          </span>
          {complaint.ipfsHash && (
            <span className="trust-badge trust-badge-ipfs" title="Stored on IPFS">
              <LinkOutlined style={{ fontSize: 10 }} aria-hidden="true" />
              IPFS
            </span>
          )}
        </div>

          <span
          className={`status-badge status-${complaint.status}`}
          role="status"
          aria-label={`Status: ${tStatus(complaint.status)}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            aria-hidden="true"
            style={{
              background: complaint.status === 'pending' ? '#f59e0b'
                : complaint.status === 'in_progress' ? '#003893'
                : complaint.status === 'resolved' ? '#059669'
                : '#dc2626'
            }}
          />
          {tStatus(complaint.status)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-slate-900 mb-1.5 leading-snug">
        {complaint.title}
      </h3>

      {/* Description */}
      {complaint.description && (
        <p className="text-sm text-slate-600 mb-3 leading-relaxed line-clamp-3">
          {complaint.description}
        </p>
      )}

      {/* Images */}
      {((complaint.imageUrls && complaint.imageUrls.length > 0) || (complaint.images && complaint.images.length > 0)) && (
        <div className="mb-3 flex flex-wrap gap-2 overflow-x-auto">
          {(complaint.imageUrls || complaint.images).map((imgSrc, idx) => {
            const isLocalBlob = imgSrc && imgSrc.startsWith('blob:');
            const src = isLocalBlob ? imgSrc : `${IPFS_GATEWAY}${imgSrc}`;
            return (
              <a
                key={idx}
                href={isLocalBlob ? undefined : src}
                target={isLocalBlob ? undefined : '_blank'}
                rel={isLocalBlob ? undefined : 'noopener noreferrer'}
                className="block"
                onClick={isLocalBlob ? (e) => e.preventDefault() : undefined}
              >
                <img
                  src={src}
                  alt={`Evidence ${idx + 1}`}
                  className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg border border-slate-200 hover:border-red-300 transition-colors cursor-pointer"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                    e.target.alt = 'Image';
                    e.target.className = 'w-24 h-24 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center';
                    e.target.parentElement.innerHTML = '<div class="w-24 h-24 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 text-xs text-center p-2">📷 Photo attached</div>';
                  }}
                />
              </a>
            );
          })}
        </div>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mb-3 overflow-hidden">
        <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
          <EnvironmentOutlined aria-hidden="true" /> {complaint.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <ClockCircleOutlined aria-hidden="true" /> <time>{formattedDate}</time>
        </span>
        <Tooltip title={complaint.author}>
          <span className="inline-flex items-center gap-1">
            <UserOutlined aria-hidden="true" /> {shortAuthor}
          </span>
        </Tooltip>
      </div>

      {/* Status Timeline (mini) */}
      {complaint.status !== 'rejected' && (
        <div className="status-timeline mb-4" aria-label="Complaint progress">
          {STATUS_ORDER.map((step, idx) => (
            <React.Fragment key={step}>
              {idx > 0 && (
                <div
                  className={`timeline-connector ${idx <= statusIndex ? 'timeline-connector-active' : ''}`}
                  aria-hidden="true"
                />
              )}
              <Tooltip title={step.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}>
                <div
                  className={`timeline-dot ${
                    idx < statusIndex ? 'timeline-dot-completed'
                    : idx === statusIndex ? 'timeline-dot-active'
                    : 'timeline-dot-pending'
                  }`}
                  aria-label={`${step.replace(/_/g, ' ')}: ${idx <= statusIndex ? 'completed' : 'pending'}`}
                >
                  {idx < statusIndex && (
                    <CheckCircleOutlined style={{ fontSize: 8, color: 'white' }} />
                  )}
                </div>
              </Tooltip>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 relative z-10">
        {/* Upvote */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleUpvote();
          }}
          onTouchEnd={(e) => {
            // Ensure touch events fire reliably on mobile
            e.preventDefault();
            handleUpvote();
          }}
          disabled={isUpvoting || hasVoted}
          aria-label={hasVoted ? `You upvoted this complaint. ${complaint.upvotes} total votes` : `Upvote this complaint. ${complaint.upvotes} current votes`}
          aria-pressed={hasVoted}
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          className={`
            inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-150 border relative z-10
            min-h-[44px]
            ${hasVoted
              ? 'bg-red-50 text-red-800 border-red-200 cursor-default'
              : 'bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-800 hover:bg-red-50 cursor-pointer active:bg-red-100'
            }
            disabled:opacity-50
          `}
        >
          {hasVoted ? <LikeFilled className="text-red-700" /> : <LikeOutlined />}
          <span className="font-semibold">{complaint.upvotes}</span>
          {hasVoted && <span className="text-xs opacity-70">{t('upvote')}</span>}
        </button>

        {/* Admin / Author controls */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => setIsStatusModalVisible(true)}
              className="text-xs"
              aria-label={t('updateStatus')}
            >
              {t('updateStatus')}
            </Button>
          )}
          {isAuthor && (
            <Popconfirm
              title={t('deleteComplaint') + '?'}
              description="This action cannot be undone."
              onConfirm={() => onDelete(complaint.id)}
              okText={t('deleteComplaint')}
              cancelText={t('cancel') || 'Cancel'}
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                className="text-xs"
                aria-label={t('deleteComplaint')}
              >
                {t('deleteComplaint')}
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        title={t('updateStatus')}
        open={isStatusModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => setIsStatusModalVisible(false)}
        okText={t('submitComplaint') || 'Save Changes'}
        centered
        width={400}
      >
        <p className="text-sm text-slate-500 mb-3">Select the new status for this complaint:</p>
        <Select
          value={selectedStatus}
          onChange={setSelectedStatus}
          style={{ width: '100%' }}
          size="large"
        >
          {COMPLAINT_STATUS.map((status) => (
            <Select.Option key={status} value={status}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{
                  background: status === 'pending' ? '#f59e0b'
                    : status === 'in_progress' ? '#003893'
                    : status === 'resolved' ? '#059669'
                    : '#dc2626'
                }} />
                {tStatus(status)}
              </span>
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </article>
  );
};

export default ComplaintCard;
