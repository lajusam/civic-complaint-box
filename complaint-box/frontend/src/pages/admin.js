import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Table, Button, Modal, Select, message, Popconfirm, Space, Tag, Tooltip } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  LockOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  LikeOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { COMPLAINT_STATUS, ADMIN_WALLET, isAdminWallet, ROLES } from '../utils/constants';
import { useRole } from '../hooks/useRole';

const Header = dynamic(() => import('../components/Header'), { ssr: false });

const STATUS_CONFIG = {
  pending: { color: 'warning', icon: <ClockCircleOutlined />, label: 'Pending' },
  in_progress: { color: 'processing', icon: <SyncOutlined spin />, label: 'In Progress' },
  resolved: { color: 'success', icon: <CheckCircleOutlined />, label: 'Resolved' },
  rejected: { color: 'error', icon: <CloseCircleOutlined />, label: 'Rejected' },
};

export default function AdminDashboard() {
  const { publicKey } = useWallet();
  const { isAdmin, isConnected, walletAddress } = useRole();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Role-based authorization — uses the useRole hook which compares
  // the connected wallet against ADMIN_WALLET constant.
  // Even if this check is bypassed in the UI, the smart contract
  // will reject unauthorized transactions with UnauthorizedAdmin error.
  const isAuthorized = isAdmin;

  useEffect(() => {
    if (isAuthorized) {
      try {
        const stored = localStorage.getItem('civic-complaints');
        setComplaints(stored ? JSON.parse(stored) : []);
      } catch {
        setComplaints([]);
      }
    }
    setLoading(false);
  }, [isAuthorized]);

  const handleDelete = useCallback((id) => {
    const updated = complaints.filter((c) => c.id !== id);
    setComplaints(updated);
    localStorage.setItem('civic-complaints', JSON.stringify(updated));
    message.success('Complaint deleted');
  }, [complaints]);

  const handleStatusUpdate = useCallback(() => {
    if (!selectedComplaintId || !selectedStatus) {
      message.warning('Select a status');
      return;
    }
    const updated = complaints.map((c) =>
      c.id === selectedComplaintId ? { ...c, status: selectedStatus } : c
    );
    setComplaints(updated);
    localStorage.setItem('civic-complaints', JSON.stringify(updated));
    message.success('Status updated');
    setStatusModalVisible(false);
    setSelectedComplaintId(null);
    setSelectedStatus('');
  }, [complaints, selectedComplaintId, selectedStatus]);

  const stats = useMemo(
    () => ({
      total: complaints.length,
      pending: complaints.filter((c) => c.status === 'pending').length,
      inProgress: complaints.filter((c) => c.status === 'in_progress').length,
      resolved: complaints.filter((c) => c.status === 'resolved').length,
      rejected: complaints.filter((c) => c.status === 'rejected').length,
    }),
    [complaints]
  );

  const resolutionRate = stats.total > 0
    ? Math.round((stats.resolved / stats.total) * 100)
    : 0;

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 220,
      render: (text, record) => (
        <div>
          <span className="font-medium text-slate-800">{text}</span>
          {record.location && (
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <EnvironmentOutlined style={{ fontSize: 10 }} />
              {record.location}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 140,
      render: (cat) => (
        <span className="category-chip">
          {cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      width: 130,
      render: (addr) =>
        addr && addr !== 'Anonymous' ? (
          <Tooltip title={addr}>
            <code className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded cursor-help">
              {addr.slice(0, 4)}...{addr.slice(-4)}
            </code>
          </Tooltip>
        ) : (
          <span className="text-xs text-slate-400">Anonymous</span>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      filters: COMPLAINT_STATUS.map((s) => ({
        text: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: s,
      })),
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
        return (
          <Tag color={cfg.color} icon={cfg.icon}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Votes',
      dataIndex: 'upvotes',
      key: 'upvotes',
      width: 80,
      sorter: (a, b) => a.upvotes - b.upvotes,
      render: (v) => (
        <span className="inline-flex items-center gap-1 font-semibold text-red-700">
          <LikeOutlined style={{ fontSize: 12 }} /> {v}
        </span>
      ),
    },
    {
      title: 'Trust',
      key: 'trust',
      width: 80,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          {record.txHash && (
            <Tooltip title="Recorded on-chain">
              <SafetyCertificateOutlined className="text-red-600" style={{ fontSize: 14 }} />
            </Tooltip>
          )}
          {record.ipfsHash && (
            <Tooltip title="Stored on IPFS">
              <span className="text-xs text-trust-600 font-medium">IPFS</span>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedComplaintId(record.id);
              setSelectedStatus(record.status);
              setStatusModalVisible(true);
            }}
            aria-label={`Update status for ${record.title}`}
          >
            Status
          </Button>
          <Popconfirm
            title="Delete complaint?"
            description="This cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />} aria-label={`Delete ${record.title}`} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Unauthorized view
  if (!isAuthorized) {
    return (
      <>
        <Head>
          <title>Admin — CivicPulse</title>
        </Head>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center p-6" id="main-content">
            <div className="glass-card p-10 max-w-md text-center animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                <LockOutlined className="text-2xl text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                Access Restricted
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                This dashboard is only accessible to the admin wallet. Connect with the correct
                wallet to proceed.
              </p>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 mb-3">
                <p className="text-xs text-slate-400 m-0">Your role</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  User (read-only)
                </span>
              </div>
              {!publicKey && (
                <div className="bg-red-50 rounded-lg p-3 border border-red-200 mb-4">
                  <p className="text-xs text-red-600 m-0 flex items-center justify-center gap-1.5">
                    <WalletOutlined /> Connect your wallet to authenticate
                  </p>
                </div>
              )}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-400 m-0">Admin wallet</p>
                <code className="text-xs text-slate-600">
                  {ADMIN_WALLET.slice(0, 8)}...{ADMIN_WALLET.slice(-8)}
                </code>
              </div>
              {publicKey && (
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 mt-3">
                  <p className="text-xs text-amber-600 m-0">Your wallet</p>
                  <code className="text-xs text-amber-700">
                    {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                  </code>
                </div>
              )}
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard — CivicPulse</title>
      </Head>

      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />

        {/* Admin Header Bar */}
        <div className="hero-gradient text-white">
          <div className="page-container py-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <DashboardOutlined style={{ fontSize: 18 }} />
              </div>
              <div>
                <h2 className="text-lg font-bold m-0" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                  Admin Dashboard
                </h2>
                <p className="text-xs hero-stat-label m-0">
                  Manage and resolve community complaints
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border-b border-slate-200 -mt-1">
          <div className="page-container py-5">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="stat-card" aria-label={`Total complaints: ${stats.total}`}>
                <div className="stat-value text-slate-800">{stats.total}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#f59e0b', borderLeftWidth: 3 }} aria-label={`Pending: ${stats.pending}`}>
                <div className="stat-value text-amber-600">{stats.pending}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#003893', borderLeftWidth: 3 }} aria-label={`In progress: ${stats.inProgress}`}>
                <div className="stat-value text-blue-800">{stats.inProgress}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#10b981', borderLeftWidth: 3 }} aria-label={`Resolved: ${stats.resolved}`}>
                <div className="stat-value text-emerald-600">{stats.resolved}</div>
                <div className="stat-label">Resolved</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#DC143C', borderLeftWidth: 3 }} aria-label={`Resolution rate: ${resolutionRate}%`}>
                <div className="stat-value text-red-700">{resolutionRate}%</div>
                <div className="stat-label">Resolution Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <main className="page-container py-6 flex-1" id="main-content" role="main">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 m-0">
                Manage Complaints
              </h3>
              <span className="text-xs text-slate-400">
                {stats.total} total &middot; {stats.pending} need attention
              </span>
            </div>
            <Table
              columns={columns}
              dataSource={complaints}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `${total} complaints` }}
              scroll={{ x: 1000 }}
              size="middle"
              locale={{
                emptyText: (
                  <div className="py-10 text-center">
                    <CheckCircleOutlined className="text-3xl text-emerald-300 mb-3" style={{ display: 'block' }} />
                    <p className="text-sm text-slate-500 m-0">No complaints yet</p>
                    <p className="text-xs text-slate-400 m-0">Complaints filed by citizens will appear here</p>
                  </div>
                ),
              }}
            />
          </div>
        </main>

        {/* Status Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <EditOutlined className="text-red-600" />
              <span>Update Status</span>
            </div>
          }
          open={statusModalVisible}
          onOk={handleStatusUpdate}
          onCancel={() => {
            setStatusModalVisible(false);
            setSelectedStatus('');
            setSelectedComplaintId(null);
          }}
          okText="Save Changes"
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
            {COMPLAINT_STATUS.map((status) => {
              const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
              return (
                <Select.Option key={status} value={status}>
                  <span className="flex items-center gap-2">
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </Select.Option>
              );
            })}
          </Select>
        </Modal>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white" role="contentinfo">
          <div className="page-container py-6 flex items-center justify-between">
            <p className="text-sm text-slate-400 m-0">
              Admin Dashboard &mdash; CivicPulse
            </p>
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <SafetyCertificateOutlined /> Powered by Solana
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
