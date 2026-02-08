import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Header
    home: 'Home',
    fileComplaint: 'File Complaint',
    about: 'About',
    admin: 'Admin',
    poweredBy: 'Powered by Solana',
    connectedWallet: 'Connected Wallet',
    network: 'Network',
    language: 'नेपाली',

    // Hero
    heroTitle1: 'Your Voice, On-Chain.',
    heroTitle2: 'Transparent Civic Action.',
    heroSubtext: 'Report civic issues, track their resolution, and hold authorities accountable — all permanently recorded on the Solana blockchain.',
    fileAComplaint: 'File a Complaint',
    cancel: 'Cancel',
    browseComplaints: 'Browse Complaints',
    totalFiled: 'Total Filed',
    resolved: 'Resolved',
    inProgress: 'In Progress',

    // Stats
    complaintsOverview: 'Complaints Overview',
    recentComplaints: 'Recent Complaints',
    noComplaintsTitle: 'No complaints found',
    noComplaintsDesc: 'Try adjusting your filters or be the first to file a complaint.',
    clearFilters: 'Clear Filters',

    // Form
    fileNewComplaint: 'File a New Complaint',
    formSubtext: 'Your voice matters. All submissions are stored permanently on-chain.',
    details: 'Details',
    whatHappened: 'What happened?',
    location: 'Location',
    where: 'Where?',
    evidence: 'Evidence',
    addPhotos: 'Add photos',
    complaintTitle: 'Complaint Title',
    titlePlaceholder: 'e.g., Broken streetlight on Main Road',
    titleHelper: 'A short, clear summary of the issue',
    category: 'Category',
    categoryPlaceholder: 'What type of issue is this?',
    categoryHelper: 'Choose the category that best fits your complaint',
    description: 'Description',
    descriptionPlaceholder: 'Describe what happened, when it happened, and how it affects the community...',
    descriptionHelper: 'The more detail you provide, the faster it can be addressed',
    locationLabel: 'Location',
    locationPlaceholder: 'e.g., Park Avenue & 3rd Street, Sector 5',
    locationHelper: 'Enter the area, street name, or landmark where the issue is located',
    uploadEvidence: 'Upload Evidence (optional)',
    dragImages: 'Drag images here or',
    clickToBrowse: 'click to browse',
    imageLimit: 'PNG, JPG up to 5MB each',
    imagesUploaded: 'image(s) uploaded',
    evidenceHelper: 'Photos help verify and prioritize your complaint',
    walletRequired: 'Wallet Required',
    walletRequiredDesc: 'Connect your Solana wallet to submit this complaint on-chain',
    back: 'Back',
    next: 'Next',
    stepOf: 'Step {current} of {total}',
    submitComplaint: 'Submit Complaint',
    submitting: 'Submitting...',

    // Submission success
    complaintFiled: 'Complaint Filed Successfully!',
    complaintFiledDesc: 'Your complaint has been recorded on the Solana blockchain and stored on IPFS for permanent, tamper-proof transparency.',
    transaction: 'Transaction',
    ipfsHash: 'IPFS Hash',
    viewComplaints: 'View Complaints',
    fileAnother: 'File Another',

    // Categories
    infrastructure: 'Infrastructure',
    safety: 'Safety',
    water_quality: 'Water Quality',
    sanitation: 'Sanitation',
    traffic: 'Traffic',
    noise_pollution: 'Noise Pollution',
    other: 'Other',

    // Status
    pending: 'Pending',
    in_progress: 'In Progress',
    'resolved': 'Resolved',

    // Card
    upvote: 'Upvote',
    upvotes: 'upvotes',
    filed: 'Filed',
    by: 'by',
    photoAttached: 'Photo attached',
    deleteComplaint: 'Delete',
    updateStatus: 'Update Status',

    // Validation messages
    validationTitle: 'Please enter a complaint title',
    validationCategory: 'Please select a category',
    validationDescription: 'Please provide at least 20 characters of description',
    validationLocation: 'Please enter the location',
    connectWalletToSubmit: 'Please connect your wallet to submit a complaint',
    submitFailed: 'Failed to submit complaint. Please try again.',
    submitSuccess: 'Complaint submitted successfully!',
    imageOnlyError: 'Only image files are allowed',
    imageSizeError: 'Image must be smaller than 5MB',
    imageUploadFailed: 'Failed to upload image. Please try again.',
    uploadSuccess: 'uploaded successfully',
    connectWalletUpvote: 'Please connect your wallet to upvote complaints',
    alreadyUpvoted: 'You have already upvoted this complaint',
    upvoteRecorded: 'Upvote recorded on-chain',
    adminOnly: 'Only the admin wallet can perform this action',
    complaintRemoved: 'Complaint removed',

    // Filter
    filterByCategory: 'Filter by Category',
    filterByStatus: 'Filter by Status',
    searchLocation: 'Search by location',
    sortBy: 'Sort By',
    newest: 'Newest First',
    oldest: 'Oldest First',
    mostUpvoted: 'Most Upvoted',
    filters: 'Filters',
  },
  ne: {
    // Header
    home: 'गृहपृष्ठ',
    fileComplaint: 'गुनासो दर्ता',
    about: 'बारेमा',
    admin: 'प्रशासक',
    poweredBy: 'सोलानाद्वारा संचालित',
    connectedWallet: 'जोडिएको वालेट',
    network: 'नेटवर्क',
    language: 'English',

    // Hero
    heroTitle1: 'तपाईंको आवाज, अन-चेनमा।',
    heroTitle2: 'पारदर्शी नागरिक कार्य।',
    heroSubtext: 'नागरिक समस्याहरू रिपोर्ट गर्नुहोस्, तिनीहरूको समाधान ट्र्याक गर्नुहोस्, र अधिकारीहरूलाई जवाफदेही बनाउनुहोस् — सबै सोलाना ब्लकचेनमा स्थायी रूपमा रेकर्ड गरिएको।',
    fileAComplaint: 'गुनासो दर्ता गर्नुहोस्',
    cancel: 'रद्द गर्नुहोस्',
    browseComplaints: 'गुनासो हेर्नुहोस्',
    totalFiled: 'कुल दर्ता',
    resolved: 'समाधान भयो',
    inProgress: 'प्रगतिमा',

    // Stats
    complaintsOverview: 'गुनासो अवलोकन',
    recentComplaints: 'हालका गुनासोहरू',
    noComplaintsTitle: 'कुनै गुनासो भेटिएन',
    noComplaintsDesc: 'फिल्टर समायोजन गर्नुहोस् वा पहिलो गुनासो दर्ता गर्नुहोस्।',
    clearFilters: 'फिल्टर हटाउनुहोस्',

    // Form
    fileNewComplaint: 'नयाँ गुनासो दर्ता गर्नुहोस्',
    formSubtext: 'तपाईंको आवाज महत्त्वपूर्ण छ। सबै पेशकर्ताहरू स्थायी रूपमा अन-चेनमा भण्डारण गरिन्छ।',
    details: 'विवरण',
    whatHappened: 'के भयो?',
    location: 'स्थान',
    where: 'कहाँ?',
    evidence: 'प्रमाण',
    addPhotos: 'फोटो थप्नुहोस्',
    complaintTitle: 'गुनासोको शीर्षक',
    titlePlaceholder: 'जस्तै: मुख्य सडकमा बिग्रिएको बत्ती',
    titleHelper: 'समस्याको छोटो, स्पष्ट सारांश',
    category: 'वर्ग',
    categoryPlaceholder: 'यो कस्तो प्रकारको समस्या हो?',
    categoryHelper: 'तपाईंको गुनासोमा सबैभन्दा उपयुक्त वर्ग छान्नुहोस्',
    description: 'विवरण',
    descriptionPlaceholder: 'के भयो, कहिले भयो, र यसले समुदायलाई कसरी असर गर्छ वर्णन गर्नुहोस्...',
    descriptionHelper: 'जति धेरै विवरण दिनुहुन्छ, त्यति छिटो समाधान हुन्छ',
    locationLabel: 'स्थान',
    locationPlaceholder: 'जस्तै: पार्क एभिन्यू र तेस्रो सडक, सेक्टर ५',
    locationHelper: 'समस्या भएको क्षेत्र, सडकको नाम, वा ल्यान्डमार्क प्रविष्ट गर्नुहोस्',
    uploadEvidence: 'प्रमाण अपलोड गर्नुहोस् (ऐच्छिक)',
    dragImages: 'यहाँ तस्बिर ड्र्याग गर्नुहोस् वा',
    clickToBrowse: 'ब्राउज गर्न क्लिक गर्नुहोस्',
    imageLimit: 'PNG, JPG प्रत्येक ५MB सम्म',
    imagesUploaded: 'तस्बिर(हरू) अपलोड भयो',
    evidenceHelper: 'तस्बिरहरूले तपाईंको गुनासो प्रमाणित र प्राथमिकता दिन मद्दत गर्छ',
    walletRequired: 'वालेट आवश्यक',
    walletRequiredDesc: 'यो गुनासो अन-चेनमा पेश गर्न आफ्नो सोलाना वालेट जोड्नुहोस्',
    back: 'पछाडि',
    next: 'अर्को',
    stepOf: 'चरण {current} मध्ये {total}',
    submitComplaint: 'गुनासो पेश गर्नुहोस्',
    submitting: 'पेश गर्दै...',

    // Submission success
    complaintFiled: 'गुनासो सफलतापूर्वक दर्ता भयो!',
    complaintFiledDesc: 'तपाईंको गुनासो सोलाना ब्लकचेनमा रेकर्ड गरिएको छ र IPFS मा स्थायी, छेडछाड-प्रूफ पारदर्शिताका लागि भण्डारण गरिएको छ।',
    transaction: 'लेनदेन',
    ipfsHash: 'IPFS ह्यास',
    viewComplaints: 'गुनासो हेर्नुहोस्',
    fileAnother: 'अर्को दर्ता गर्नुहोस्',

    // Categories
    infrastructure: 'पूर्वाधार',
    safety: 'सुरक्षा',
    water_quality: 'पानीको गुणस्तर',
    sanitation: 'सरसफाइ',
    traffic: 'यातायात',
    noise_pollution: 'ध्वनि प्रदूषण',
    other: 'अन्य',

    // Status
    pending: 'विचाराधीन',
    in_progress: 'प्रगतिमा',
    'resolved': 'समाधान भयो',

    // Card
    upvote: 'समर्थन',
    upvotes: 'समर्थन',
    filed: 'दर्ता',
    by: 'द्वारा',
    photoAttached: 'फोटो संलग्न',
    deleteComplaint: 'मेटाउनुहोस्',
    updateStatus: 'स्थिति अपडेट',

    // Validation messages
    validationTitle: 'कृपया गुनासोको शीर्षक प्रविष्ट गर्नुहोस्',
    validationCategory: 'कृपया वर्ग छान्नुहोस्',
    validationDescription: 'कृपया कम्तिमा २० अक्षरको विवरण दिनुहोस्',
    validationLocation: 'कृपया स्थान प्रविष्ट गर्नुहोस्',
    connectWalletToSubmit: 'गुनासो पेश गर्न कृपया आफ्नो वालेट जोड्नुहोस्',
    submitFailed: 'गुनासो पेश गर्न असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।',
    submitSuccess: 'गुनासो सफलतापूर्वक पेश भयो!',
    imageOnlyError: 'तस्बिर फाइलहरू मात्र अनुमति छ',
    imageSizeError: 'तस्बिर ५MB भन्दा सानो हुनुपर्छ',
    imageUploadFailed: 'तस्बिर अपलोड गर्न असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।',
    uploadSuccess: 'सफलतापूर्वक अपलोड भयो',
    connectWalletUpvote: 'गुनासोमा समर्थन गर्न कृपया आफ्नो वालेट जोड्नुहोस्',
    alreadyUpvoted: 'तपाईंले पहिले नै यो गुनासोमा समर्थन गरिसक्नुभएको छ',
    upvoteRecorded: 'समर्थन अन-चेनमा रेकर्ड भयो',
    adminOnly: 'यो कार्य प्रशासक वालेटले मात्र गर्न सक्छ',
    complaintRemoved: 'गुनासो हटाइयो',

    // Filter
    filterByCategory: 'वर्ग अनुसार फिल्टर',
    filterByStatus: 'स्थिति अनुसार फिल्टर',
    searchLocation: 'स्थान अनुसार खोज्नुहोस्',
    sortBy: 'क्रमबद्ध गर्नुहोस्',
    newest: 'नयाँ पहिले',
    oldest: 'पुरानो पहिले',
    mostUpvoted: 'सबैभन्दा धेरै समर्थित',
    filters: 'फिल्टरहरू',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  // Persist language preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('civic-language');
      if (saved === 'ne' || saved === 'en') setLanguage(saved);
    } catch {}
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const next = prev === 'en' ? 'ne' : 'en';
      try { localStorage.setItem('civic-language', next); } catch {}
      return next;
    });
  }, []);

  const t = useCallback((key, params) => {
    let text = translations[language]?.[key] || translations.en[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  }, [language]);

  // Translate category key to display name
  const tCategory = useCallback((cat) => {
    return translations[language]?.[cat] || translations.en[cat] || cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }, [language]);

  // Translate status key to display name
  const tStatus = useCallback((status) => {
    return translations[language]?.[status] || translations.en[status] || status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, tCategory, tStatus }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
