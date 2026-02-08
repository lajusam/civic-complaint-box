// ComplaintForm Component
// Form for users to create and submit new complaints
// Handles text input, image uploads, and IPFS submission

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Form, Button, Select, Input, Upload, message, Card, Row, Col } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { uploadComplaintToIPFS, uploadImageToIPFS } from '../utils/ipfs';
import { COMPLAINT_CATEGORIES } from '../utils/constants';

/**
 * ComplaintForm Component
 * @param {Function} onComplaintCreated - Callback when complaint is successfully created
 */
const ComplaintForm = ({ onComplaintCreated }) => {
  const { publicKey, signTransaction } = useWallet();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  // Handle form submission
  const onFinish = async (values) => {
    if (!publicKey) {
      message.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // Prepare complaint data
      const complaintData = {
        title: values.title,
        description: values.description,
        category: values.category,
        location: values.location,
        images: uploadedImages,
        author: publicKey.toString(),
        createdAt: new Date().toISOString(),
      };

      // Upload to IPFS
      const ipfsHash = await uploadComplaintToIPFS(complaintData);
      message.success('Complaint uploaded to IPFS successfully!');

      // Call parent callback with IPFS hash
      onComplaintCreated({
        ipfsHash,
        category: values.category,
        location: values.location,
      });

      // Reset form
      form.resetFields();
      setUploadedImages([]);
    } catch (error) {
      console.error('Error creating complaint:', error);
      message.error('Failed to create complaint: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload to IPFS
  const beforeUpload = async (file) => {
    try {
      setLoading(true);
      const imageHash = await uploadImageToIPFS(file);
      setUploadedImages([...uploadedImages, imageHash]);
      message.success('Image uploaded to IPFS');
      setLoading(false);
      return false; // Prevent default upload
    } catch (error) {
      message.error('Failed to upload image');
      setLoading(false);
      return false;
    }
  };

  return (
    <Card title="File a New Complaint" className="complaint-form">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark="optional"
      >
        {/* Title Input */}
        <Form.Item
          name="title"
          label="Complaint Title"
          rules={[
            { required: true, message: 'Please enter a title' },
            { max: 100, message: 'Title must be less than 100 characters' },
          ]}
        >
          <Input placeholder="Brief title of your complaint" />
        </Form.Item>

        {/* Description Input */}
        <Form.Item
          name="description"
          label="Detailed Description"
          rules={[
            { required: true, message: 'Please enter a description' },
            { min: 20, message: 'Description must be at least 20 characters' },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Provide detailed information about your complaint"
          />
        </Form.Item>

        {/* Category Selection */}
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please select a category' }]}
        >
          <Select placeholder="Select complaint category">
            {COMPLAINT_CATEGORIES.map((cat) => (
              <Select.Option key={cat} value={cat}>
                {cat.replace('_', ' ').toUpperCase()}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Location Input */}
        <Form.Item
          name="location"
          label="Location"
          rules={[
            { required: true, message: 'Please enter the location' },
            { max: 100, message: 'Location must be less than 100 characters' },
          ]}
        >
          <Input placeholder="Area/Street/Landmark" />
        </Form.Item>

        {/* Image Upload */}
        <Form.Item label="Attach Images (Optional)">
          <Upload
            beforeUpload={beforeUpload}
            multiple
            accept="image/*"
            disabled={loading}
          >
            <Button icon={loading ? <LoadingOutlined /> : <UploadOutlined />}>
              Upload Images
            </Button>
          </Upload>
          {uploadedImages.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              {uploadedImages.length} image(s) uploaded
            </p>
          )}
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!publicKey}
            className="w-full"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </Button>
        </Form.Item>

        {!publicKey && (
          <p className="text-red-500 text-sm">
            ⚠️ Please connect your Phantom wallet to submit complaints
          </p>
        )}
      </Form>
    </Card>
  );
};

export default ComplaintForm;
