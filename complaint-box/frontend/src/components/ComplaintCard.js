// ComplaintCard Component
// Displays a single complaint with details, upvote button, and admin controls

import React, { useState } from 'react';
import { Card, Button, Row, Col, Tag, Space, Modal, Select, message, Popconfirm } from 'antd';
import {
  LikeOutlined,
  LikeFilled,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { COMPLAINT_STATUS, ADMIN_WALLET } from '../utils/constants';

/**
 * ComplaintCard Component
 * @param {Object} complaint - Complaint data
 * @param {boolean} hasVoted - Whether current user has voted
 * @param {Function} onUpvote - Callback for upvote action
 * @param {Function} onStatusUpdate - Callback for status update (admin only)
 * @param {Function} onDelete - Callback for delete action
 * @param {string} currentUserAddress - Current user's wallet address
 */
const ComplaintCard = ({
  complaint,
  hasVoted,
  onUpvote,
  onStatusUpdate,
  onDelete,
  currentUserAddress,
}) => {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(complaint.status);
  const isAdmin = currentUserAddress === ADMIN_WALLET;
  const isAuthor = currentUserAddress === complaint.author;

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle upvote
  const handleUpvote = async () => {
    setIsUpvoting(true);
    try {
      await onUpvote(complaint.id);
      message.success('Upvote recorded!');
    } catch (error) {
      message.error('Failed to upvote: ' + error.message);
    } finally {
      setIsUpvoting(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    try {
      await onStatusUpdate(complaint.id, selectedStatus);
      message.success('Status updated successfully!');
      setIsStatusModalVisible(false);
    } catch (error) {
      message.error('Failed to update status: ' + error.message);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      in_progress: 'blue',
      resolved: 'green',
      rejected: 'red',
    };
    return colors[status] || 'default';
  };

  return (
    <Card
      className="complaint-card mb-4 hover:shadow-lg transition-shadow"
      hoverable
    >
      {/* Header with Status Tag */}
      <Row justify="space-between" align="middle" className="mb-3">
        <Col>
          <h3 className="text-lg font-semibold mb-0">{complaint.title}</h3>
        </Col>
        <Col>
          <Tag color={getStatusColor(complaint.status)}>
            {complaint.status.replace('_', ' ').toUpperCase()}
          </Tag>
        </Col>
      </Row>

      {/* Category and Location */}
      <Row className="mb-2 text-gray-600">
        <Col span={24}>
          <Space>
            <span>
              <strong>Category:</strong> {complaint.category}
            </span>
            <span>
              <EnvironmentOutlined /> {complaint.location}
            </span>
          </Space>
        </Col>
      </Row>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-3">{complaint.description}</p>

      {/* Metadata: Author, Date */}
      <Row className="mb-3 text-xs text-gray-500">
        <Col span={12}>
          <Space>
            <UserOutlined />
            <span>{complaint.author.slice(0, 8)}...{complaint.author.slice(-4)}</span>
          </Space>
        </Col>
        <Col span={12}>
          <Space>
            <CalendarOutlined />
            <span>{formatDate(complaint.createdAt)}</span>
          </Space>
        </Col>
      </Row>

      {/* Upvote Section */}
      <Row align="middle" className="border-t pt-3">
        <Col span={12}>
          <Button
            type={hasVoted ? 'primary' : 'default'}
            icon={hasVoted ? <LikeFilled /> : <LikeOutlined />}
            onClick={handleUpvote}
            loading={isUpvoting}
            disabled={isUpvoting || hasVoted}
          >
            {complaint.upvotes} Upvotes {hasVoted ? '(Voted)' : ''}
          </Button>
        </Col>

        {/* Controls: Admin Status Update + Author Delete */}
        <Col span={12} style={{ textAlign: 'right' }}>
          <Space>
            {isAdmin && (
              <Button
                type="dashed"
                onClick={() => setIsStatusModalVisible(true)}
              >
                Update Status
              </Button>
            )}
            {isAuthor && (
              <Popconfirm
                title="Delete your complaint?"
                description="This action cannot be undone."
                onConfirm={() => onDelete(complaint.id)}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                >
                  Delete
                </Button>
              </Popconfirm>
            )}
          </Space>
        </Col>
      </Row>

      {/* Status Update Modal */}
      <Modal
        title="Update Complaint Status"
        visible={isStatusModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => setIsStatusModalVisible(false)}
      >
        <Select
          value={selectedStatus}
          onChange={setSelectedStatus}
          style={{ width: '100%' }}
        >
          {COMPLAINT_STATUS.map((status) => (
            <Select.Option key={status} value={status}>
              {status.replace('_', ' ').toUpperCase()}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </Card>
  );
};

export default ComplaintCard;
