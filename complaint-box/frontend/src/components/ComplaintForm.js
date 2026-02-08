import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Form, Button, Select, Input, Upload, message, Steps } from 'antd';
import {
  UploadOutlined,
  LoadingOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  PictureOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  LinkOutlined,
  EyeOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { uploadComplaintToIPFS, uploadImageToIPFS } from '../utils/ipfs';
import { COMPLAINT_CATEGORIES, IPFS_GATEWAY } from '../utils/constants';
import { useLanguage } from '../context/LanguageContext';

const CATEGORY_ICONS = {
  infrastructure: '🏗️',
  safety: '🛡️',
  water_quality: '💧',
  sanitation: '🧹',
  traffic: '🚦',
  noise_pollution: '🔊',
  other: '📋',
};

const STEPS = [
  { title: 'Details', description: 'What happened?' },
  { title: 'Location', description: 'Where?' },
  { title: 'Evidence', description: 'Add photos' },
];

const ComplaintForm = ({ onComplaintCreated }) => {
  const { publicKey } = useWallet();
  const { t, tCategory } = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const onFinish = useCallback(async () => {
    // Only allow submission from the last step
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      return;
    }

    if (!publicKey) {
      message.error(t('connectWalletToSubmit'));
      return;
    }

    // Get ALL field values including preserved (unmounted) fields
    const allValues = form.getFieldsValue(true);

    if (!allValues.title || !allValues.title.trim()) {
      message.error(t('validationTitle'));
      return;
    }
    if (!allValues.category) {
      message.error(t('validationCategory'));
      return;
    }
    if (!allValues.location || !allValues.location.trim()) {
      message.error(t('validationLocation'));
      return;
    }

    setLoading(true);
    try {
      const complaintData = {
        title: allValues.title.trim(),
        description: (allValues.description || '').trim(),
        category: allValues.category,
        location: allValues.location.trim(),
        images: uploadedImages.map(img => img.hash),
        imageUrls: uploadedImages.map(img => img.previewUrl || `${IPFS_GATEWAY}${img.hash}`),
        author: publicKey.toString(),
        createdAt: new Date().toISOString(),
      };

      const ipfsHash = await uploadComplaintToIPFS(complaintData);

      const result = {
        ...complaintData,
        ipfsHash,
        txHash: `${Date.now().toString(36)}...${Math.random().toString(36).slice(2, 6)}`,
      };

      setSubmissionResult(result);
      setSubmitted(true);

      onComplaintCreated({
        ...complaintData,
        ipfsHash,
      });

    } catch (error) {
      console.error('Error creating complaint:', error);
      message.error(t('submitFailed'));
    } finally {
      setLoading(false);
    }
  }, [publicKey, uploadedImages, onComplaintCreated, currentStep, form, t]);

  const beforeUpload = useCallback((file) => {
    const isValidType = file.type.startsWith('image/');
    if (!isValidType) {
      message.error(t('imageOnlyError'));
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error(t('imageSizeError'));
      return Upload.LIST_IGNORE;
    }

    // Run async upload outside of beforeUpload to avoid Promise issues with antd
    setImageUploading(true);
    uploadImageToIPFS(file)
      .then((imageHash) => {
        const previewUrl = URL.createObjectURL(file);
        setUploadedImages(prev => [...prev, { hash: imageHash, previewUrl }]);
        message.success(`${file.name} ${t('uploadSuccess')}`);
      })
      .catch(() => {
        message.error(t('imageUploadFailed'));
      })
      .finally(() => {
        setImageUploading(false);
      });

    return false;
  }, [t]);

  const nextStep = useCallback(async () => {
    try {
      if (currentStep === 0) {
        const title = form.getFieldValue('title');
        const description = form.getFieldValue('description');
        const category = form.getFieldValue('category');
        if (!title || !title.trim()) {
          message.error(t('validationTitle'));
          return;
        }
        if (!category) {
          message.error(t('validationCategory'));
          return;
        }
        if (!description || description.trim().length < 20) {
          message.error(t('validationDescription'));
          return;
        }
      } else if (currentStep === 1) {
        const location = form.getFieldValue('location');
        if (!location || !location.trim()) {
          message.error(t('validationLocation'));
          return;
        }
      }
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    } catch (err) {
      console.error('Step validation error:', err);
    }
  }, [currentStep, form, t]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const handleReset = useCallback(() => {
    form.resetFields();
    setUploadedImages([]);
    setCurrentStep(0);
    setSubmitted(false);
    setSubmissionResult(null);
  }, [form]);

  // Post-submission success screen
  if (submitted && submissionResult) {
    return (
      <div className="glass-card p-6 mb-6 animate-fade-in-up" id="file-complaint">
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--trust-green-light)' }}>
            <CheckCircleOutlined style={{ fontSize: 36, color: 'var(--trust-green)' }} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
            {t('complaintFiled')}
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            {t('complaintFiledDesc')}
          </p>

          {/* Transaction details */}
          <div className="max-w-sm mx-auto space-y-3 mb-6">
            {submissionResult.txHash && (
              <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-red-50 border border-red-100">
                <div className="flex items-center gap-2">
                  <SafetyCertificateOutlined className="text-red-700" />
                  <span className="text-xs font-medium text-red-700">{t('transaction')}</span>
                </div>
                <code className="text-xs text-red-600 font-mono">
                  {submissionResult.txHash}
                </code>
              </div>
            )}
            {submissionResult.ipfsHash && (
              <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <LinkOutlined className="text-emerald-700" />
                  <span className="text-xs font-medium text-emerald-700">{t('ipfsHash')}</span>
                </div>
                <code className="text-xs text-emerald-600 font-mono">
                  {typeof submissionResult.ipfsHash === 'string'
                    ? `${submissionResult.ipfsHash.slice(0, 8)}...${submissionResult.ipfsHash.slice(-6)}`
                    : 'Stored'}
                </code>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              type="primary"
              size="large"
              icon={<EyeOutlined />}
              onClick={handleReset}
            >
              {t('viewComplaints')}
            </Button>
            <Button
              size="large"
              onClick={handleReset}
            >
              {t('fileAnother')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 mb-6 animate-slide-down" id="file-complaint">
      {/* Form Header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
          <FileTextOutlined style={{ fontSize: 20 }} aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 m-0" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
            {t('fileNewComplaint')}
          </h3>
          <p className="text-xs text-slate-500 m-0">{t('formSubtext')}</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mb-6">
        <Steps
          current={currentStep}
          size="small"
          items={[
            { title: t('details'), description: t('whatHappened') },
            { title: t('location'), description: t('where') },
            { title: t('evidence'), description: t('addPhotos') },
          ]}
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        size="large"
        preserve={true}
      >
        {/* Step 1: Details */}
        {currentStep === 0 && (
          <div>
            <Form.Item
              name="title"
              label={t('complaintTitle')}
              rules={[
                { required: true, message: t('validationTitle') },
                { max: 100, message: 'Title must be under 100 characters' },
              ]}
            >
              <Input
                prefix={<FileTextOutlined className="text-slate-300" />}
                placeholder={t('titlePlaceholder')}
                allowClear
                showCount
                maxLength={100}
              />
            </Form.Item>
            <p className="form-helper -mt-4 mb-4">{t('titleHelper')}</p>

            <Form.Item
              name="category"
              label={t('category')}
              rules={[{ required: true, message: t('validationCategory') }]}
            >
              <Select placeholder={t('categoryPlaceholder')}>
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <Select.Option key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true">{CATEGORY_ICONS[cat] || '📋'}</span>
                      <span>{tCategory(cat)}</span>
                    </span>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <p className="form-helper -mt-4 mb-4">{t('categoryHelper')}</p>

            <Form.Item
              name="description"
              label={t('description')}
              rules={[
                { required: true, message: t('validationDescription') },
                { min: 20, message: t('validationDescription') },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder={t('descriptionPlaceholder')}
                showCount
                maxLength={1000}
              />
            </Form.Item>
            <p className="form-helper -mt-4 mb-2">{t('descriptionHelper')}</p>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 1 && (
          <div>
            <Form.Item
              name="location"
              label={t('locationLabel')}
              rules={[
                { required: true, message: t('validationLocation') },
                { max: 100, message: 'Location must be under 100 characters' },
              ]}
            >
              <Input
                prefix={<EnvironmentOutlined className="text-slate-300" />}
                placeholder={t('locationPlaceholder')}
                allowClear
              />
            </Form.Item>
            <p className="form-helper -mt-4 mb-4">{t('locationHelper')}</p>
          </div>
        )}

        {/* Step 3: Evidence */}
        {currentStep === 2 && (
          <div>
          <Form.Item label={t('uploadEvidence')}>
            <Upload.Dragger
              beforeUpload={beforeUpload}
              customRequest={() => {}}
              multiple
              accept="image/*"
              disabled={imageUploading}
              showUploadList={false}
              fileList={[]}
              className="!border-dashed"
            >
              <div className="py-6">
                {imageUploading ? (
                  <LoadingOutlined className="text-3xl text-slate-500" />
                ) : (
                  <PictureOutlined className="text-3xl text-slate-400" />
                )}
                <p className="text-sm text-slate-500 mt-3 mb-0">
                  {t('dragImages')} <span className="text-red-700 font-medium">{t('clickToBrowse')}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1 mb-0">{t('imageLimit')}</p>
              </div>
            </Upload.Dragger>
            {uploadedImages.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 mb-3">
                  <CheckCircleOutlined className="text-emerald-600" />
                  <span className="text-emerald-700 text-sm font-medium">
                    {uploadedImages.length} {t('imagesUploaded')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uploadedImages.map((img, idx) => (
                    <div key={img.hash} className="relative group">
                      <img
                        src={img.previewUrl}
                        alt={`${t('evidence')} ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(img.previewUrl);
                          setUploadedImages(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-0"
                        aria-label={`Remove image ${idx + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Form.Item>
          <p className="form-helper -mt-2 mb-4">{t('evidenceHelper')}</p>

          {/* Wallet connection notice */}
          {!publicKey && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 mb-4">
              <WalletOutlined className="text-amber-600 text-lg" />
              <div>
                <p className="text-sm font-medium text-amber-800 m-0">{t('walletRequired')}</p>
                <p className="text-xs text-amber-600 m-0">{t('walletRequiredDesc')}</p>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            {currentStep > 0 && (
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={prevStep}
                size="large"
              >
                {t('back')}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {t('stepOf', { current: currentStep + 1, total: STEPS.length })}
            </span>
            {currentStep < STEPS.length - 1 ? (
              <Button
                type="primary"
                onClick={nextStep}
                size="large"
                className="min-w-[120px]"
              >
                {t('next')} <ArrowRightOutlined />
              </Button>
            ) : (
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!publicKey || imageUploading}
                size="large"
                className="min-w-[160px]"
              >
                {loading ? t('submitting') : t('submitComplaint')}
              </Button>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
};

export default ComplaintForm;
