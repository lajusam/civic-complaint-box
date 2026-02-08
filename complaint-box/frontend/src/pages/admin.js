// pages/admin.js
// Admin dashboard for managing complaint statuses (restricted page)

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Layout, Table, Button, Modal, Select, message, Row, Col, Card, Statistic, Popconfirm, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { COMPLAINT_STATUS, ADMIN_WALLET } from '../utils/constants';

// Import Header with SSR disabled to avoid hydration errors
const Header = dynamic(() => import('../components/Header'), { ssr: false });

/**
 * Admin Dashboard - Restricted to admin wallet only
 * Manage complaint statuses and view statistics
 */
export default function AdminDashboard() {
  const { publicKey } = useWallet();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [statSelectedStatus, setStatSelectedStatus] = useState('');
  const [statModalVisible, setStatModalVisible] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Check admin authorization
  useEffect(() => {
    if (publicKey && publicKey.toString() === ADMIN_WALLET) {
      setIsAuthorized(true);
      loadComplaints();
    }
  }, [publicKey]);

  // Load complaints from localStorage or blockchain
  const loadComplaints = async () => {
    setLoading(true);
    try {
      // TODO: Fetch complaints from Solana program using Anchor
      // Example:
      // const program = getProgram(wallet, COMPLAINT_IDL);
      // const allComplaints = await program.account.complaint.all();
      
      // Load from localStorage
      const storedComplaints = localStorage.getItem('civic-complaints');
      
      if (storedComplaints) {
        setComplaints(JSON.parse(storedComplaints));
      } else {
        // Mock data as fallback
        const mockComplaints = [
          {
            id: '1',
            title: 'Pothole on Main Street',
            author: publicKey?.toString() || 'Unknown',
            status: 'pending',
            category: 'infrastructure',
            upvotes: 45,
            createdAt: new Date(),
          },
        ];
        setComplaints(mockComplaints);
      }
    } catch (error) {
      console.error('Error loading complaints:', error);
      message.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  // Handle complaint deletion (admin only)
  const handleDelete = async (complaintId) => {
    try {
      // TODO: Call deleteComplaint instruction on blockchain
      // Example:
      // const program = getProgram(wallet, COMPLAINT_IDL);
      // await program.methods.deleteComplaint()
      //   .accounts({complaint: complaintPDA, admin: publicKey})
      //   .rpc();

      // Filter out deleted complaint
      const updatedComplaints = complaints.filter((c) => c.id !== complaintId);
      setComplaints(updatedComplaints);
      
      // Save to localStorage
      localStorage.setItem('civic-complaints', JSON.stringify(updatedComplaints));
      
      message.success('Complaint deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete complaint');
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedComplaintId || !statSelectedStatus) {
      message.warning('Please select a status');
      return;
    }

    try {
      // TODO: Call updateStatus instruction on blockchain
      // Example:
      // const program = getProgram(wallet, COMPLAINT_IDL);
      // const complaintPDA = await PublicKey.findProgramAddress(...);
      // await program.methods.updateStatus(statSelectedStatus)
      //   .accounts({complaint: complaintPDA, admin: publicKey})
      //   .rpc();

      // Update local state
      const updatedComplaints = complaints.map((complaint) => {
        if (complaint.id === selectedComplaintId) {
          return { ...complaint, status: statSelectedStatus };
        }
        return complaint;
      });
      
      setComplaints(updatedComplaints);
      
      // Save to localStorage
      localStorage.setItem('civic-complaints', JSON.stringify(updatedComplaints));

      message.success('Status updated successfully!');
      setStatModalVisible(false);
      setStatSelectedStatus('');
      setSelectedComplaintId(null);
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status: ' + error.message);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: (text) => `${text.slice(0, 8)}...${text.slice(-4)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Upvotes',
      dataIndex: 'upvotes',
      key: 'upvotes',
      sorter: (a, b) => a.upvotes - b.upvotes,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isAuthor = publicKey?.toString() === record.author;
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setSelectedComplaintId(record.id);
                setStatSelectedStatus(record.status);
                setStatModalVisible(true);
              }}
            >
              Update Status
            </Button>
            {isAuthor && (
              <Popconfirm
                title="Delete your complaint?"
                description="This action cannot be undone."
                onConfirm={() => handleDelete(record.id)}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                >
                  Delete
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  // Unauthorized view
  if (!isAuthorized) {
    return (
      <Layout className="min-h-screen">
        <Header />
        <Layout.Content className="px-6 py-8">
          <Card>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p>
              You are not authorized to access this page. Only the designated admin wallet can
              view this dashboard.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Admin Wallet: {ADMIN_WALLET.slice(0, 8)}...{ADMIN_WALLET.slice(-4)}
            </p>
            {publicKey && (
              <p className="text-sm text-gray-500">
                Your Wallet: {publicKey.toString().slice(0, 8)}...
                {publicKey.toString().slice(-4)}
              </p>
            )}
          </Card>
        </Layout.Content>
      </Layout>
    );
  }

  // Calculate statistics
  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === 'pending').length,
    inProgress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />

      <Layout.Content className="px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Statistics */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Complaints"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pending"
                value={stats.pending}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="In Progress"
                value={stats.inProgress}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Resolved"
                value={stats.resolved}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Complaints Table */}
        <Card title="Manage Complaints">
          <Table
            columns={columns}
            dataSource={complaints}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>

        {/* Status Update Modal */}
        <Modal
          title="Update Complaint Status"
          visible={statModalVisible}
          onOk={handleStatusUpdate}
          onCancel={() => {
            setStatModalVisible(false);
            setStatSelectedStatus('');
            setSelectedComplaintId(null);
          }}
        >
          <label className="block mb-2 font-semibold">Select New Status:</label>
          <Select
            value={statSelectedStatus}
            onChange={setStatSelectedStatus}
            style={{ width: '100%' }}
            placeholder="Choose a status"
          >
            {COMPLAINT_STATUS.map((status) => (
              <Select.Option key={status} value={status}>
                {status.replace('_', ' ').toUpperCase()}
              </Select.Option>
            ))}
          </Select>
        </Modal>
      </Layout.Content>

      <Layout.Footer className="text-center text-gray-600 bg-white mt-8">
        <p>🏛️ Admin Dashboard - Civic Complaint Box</p>
      </Layout.Footer>
    </Layout>
  );
}
