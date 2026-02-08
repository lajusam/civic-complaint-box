// pages/index.js
// Main home page showing complaint feed and form

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Layout, Row, Col, Spin, Empty, Button, Space, Menu, message } from 'antd';
import { useWallet } from '@solana/wallet-adapter-react';
import { getComplaintFromIPFS } from '../utils/ipfs';

// Import components with SSR disabled to avoid hydration errors with icons
const Header = dynamic(() => import('../components/Header'), { ssr: false });
const ComplaintForm = dynamic(() => import('../components/ComplaintForm'), { ssr: false });
const ComplaintCard = dynamic(() => import('../components/ComplaintCard'), { ssr: false });
const ComplaintFilter = dynamic(() => import('../components/ComplaintFilter'), { ssr: false });

/**
 * Home Page - Main application interface
 * Displays complaint feed, filters, and submission form
 */
export default function Home() {
  const { publicKey } = useWallet();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userVotes, setUserVotes] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    categories: [],
    statuses: [],
    location: '',
  });

  // Load complaints from localStorage or blockchain
  const loadComplaints = async () => {
    setLoading(true);
    try {
      // TODO: Fetch complaints from Solana program
      // This is a placeholder - in production, use Anchor IDL to fetch on-chain data
      // Example:
      // const program = getProgram(wallet, COMPLAINT_IDL);
      // const allComplaints = await program.account.complaint.all();
      
      // Load from localStorage first
      const storedComplaints = localStorage.getItem('civic-complaints');
      const storedVotes = localStorage.getItem('civic-user-votes');
      
      if (storedComplaints) {
        setComplaints(JSON.parse(storedComplaints));
      } else {
        // If no stored data, use mock data as seed
        const mockComplaints = [
          {
            id: '1',
            title: 'Pothole on Main Street',
            description: 'Large pothole causing traffic hazard near the market junction',
            category: 'infrastructure',
            location: 'Main Street Market',
            author: publicKey?.toString() || 'Anonymous',
            createdAt: Math.floor(Date.now() / 1000) - 86400,
            upvotes: 45,
            status: 'in_progress',
          },
        ];
        setComplaints(mockComplaints);
        localStorage.setItem('civic-complaints', JSON.stringify(mockComplaints));
      }
      
      if (storedVotes) {
        setUserVotes(JSON.parse(storedVotes));
      }
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load complaints on component mount
  useEffect(() => {
    loadComplaints();
  }, []);

  // Save complaints to localStorage whenever they change
  useEffect(() => {
    if (complaints.length > 0) {
      localStorage.setItem('civic-complaints', JSON.stringify(complaints));
    }
  }, [complaints]);

  // Save user votes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('civic-user-votes', JSON.stringify(userVotes));
  }, [userVotes]);

  // Filter complaints based on current filters
  const filteredComplaints = complaints.filter((complaint) => {
    const categoryMatch =
      filters.categories.length === 0 || filters.categories.includes(complaint.category);
    const statusMatch =
      filters.statuses.length === 0 || filters.statuses.includes(complaint.status);
    const locationMatch =
      filters.location === '' ||
      complaint.location.toLowerCase().includes(filters.location.toLowerCase());

    return categoryMatch && statusMatch && locationMatch;
  });

  // Handle complaint creation
  const handleComplaintCreated = async (complaintData) => {
    setSubmitLoading(true);
    try {
      // TODO: Create transaction to store complaint on-chain
      // Example:
      // const program = getProgram(wallet, COMPLAINT_IDL);
      // const complaintPDA = await PublicKey.findProgramAddress(...);
      // await program.methods.createComplaint(
      //   complaintData.ipfsHash,
      //   complaintData.category,
      //   complaintData.location
      // ).accounts({...}).rpc();

      // For now, add to local state
      const newComplaint = {
        id: Math.random().toString(),
        ...complaintData,
        author: publicKey?.toString(),
        createdAt: Math.floor(Date.now() / 1000),
        upvotes: 0,
        status: 'pending',
      };

      setComplaints([newComplaint, ...complaints]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating complaint on-chain:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle upvote
  const handleUpvote = async (complaintId) => {
    // TODO: Call upvoteComplaint instruction on blockchain
    // Example:
    // const program = getProgram(wallet, COMPLAINT_IDL);
    // await program.methods.upvoteComplaint()
    //   .accounts({complaint: complaintPDA, voter: publicKey})
    //   .rpc();

    if (!publicKey) {
      message.error('Please connect wallet to upvote');
      return;
    }

    // Check if user has already voted
    if (userVotes[complaintId]) {
      message.warning('You have already upvoted this complaint!');
      return;
    }

    // Update local state
    const updatedComplaints = complaints.map((complaint) => {
      if (complaint.id === complaintId) {
        return {
          ...complaint,
          upvotes: complaint.upvotes + 1,
        };
      }
      return complaint;
    });
    
    setComplaints(updatedComplaints);

    // Update user votes
    const updatedVotes = {
      ...userVotes,
      [complaintId]: true,
    };
    setUserVotes(updatedVotes);
    
    // Save both to localStorage
    localStorage.setItem('civic-complaints', JSON.stringify(updatedComplaints));
    localStorage.setItem('civic-user-votes', JSON.stringify(updatedVotes));
  };

  // Handle complaint deletion
  const handleDelete = async (complaintId) => {
    // TODO: Call deleteComplaint instruction on blockchain
    // Example:
    // const program = getProgram(wallet, COMPLAINT_IDL);
    // await program.methods.deleteComplaint()
    //   .accounts({complaint: complaintPDA, authority: publicKey})
    //   .rpc();

    if (!publicKey) {
      message.error('Please connect wallet to delete');
      return;
    }

    // Filter out the deleted complaint
    const updatedComplaints = complaints.filter((complaint) => complaint.id !== complaintId);
    setComplaints(updatedComplaints);
    
    // Also remove any votes for this complaint
    const updatedVotes = { ...userVotes };
    delete updatedVotes[complaintId];
    setUserVotes(updatedVotes);
    
    // Save to localStorage
    localStorage.setItem('civic-complaints', JSON.stringify(updatedComplaints));
    localStorage.setItem('civic-user-votes', JSON.stringify(updatedVotes));
    
    message.success('Complaint deleted successfully');
  };

  // Handle status update (admin only)
  const handleStatusUpdate = async (complaintId, newStatus) => {
    // TODO: Call updateStatus instruction on blockchain (admin only)
    // Example:
    // const program = getProgram(wallet, COMPLAINT_IDL);
    // await program.methods.updateStatus(newStatus)
    //   .accounts({complaint: complaintPDA, admin: publicKey})
    //   .rpc();

    setComplaints(
      complaints.map((complaint) => {
        if (complaint.id === complaintId) {
          return {
            ...complaint,
            status: newStatus,
          };
        }
        return complaint;
      })
    );
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <Layout.Content className="px-6 py-8">
        <Row gutter={[24, 24]}>
          {/* Left Sidebar: Filters */}
          <Col xs={24} sm={24} md={6}>
            <ComplaintFilter
              onFilterChange={setFilters}
              currentFilters={filters}
            />
          </Col>

          {/* Center: Main Feed */}
          <Col xs={24} sm={24} md={18}>
            {/* Submit Form Toggle */}
            <div className="mb-4">
              <Button
                type="primary"
                size="large"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancel' : '+ File New Complaint'}
              </Button>
            </div>

            {/* Complaint Form */}
            {showForm && (
              <ComplaintForm
                onComplaintCreated={handleComplaintCreated}
              />
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-8">
                <Spin size="large" tip="Loading complaints..." />
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredComplaints.length === 0 && (
              <Empty
                description={
                  complaints.length === 0
                    ? 'No complaints yet. Be the first to file one!'
                    : 'No complaints match your filters.'
                }
                className="mt-8"
              />
            )}

            {/* Complaints Feed */}
            {!loading &&
              filteredComplaints.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  hasVoted={userVotes[complaint.id] || false}
                  onUpvote={handleUpvote}
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={handleDelete}
                  currentUserAddress={publicKey?.toString()}
                />
              ))}
          </Col>
        </Row>
      </Layout.Content>

      {/* Footer */}
      <Layout.Footer className="text-center text-gray-600 bg-white mt-8">
        <p>
          🏛️ Civic Complaint Box © 2024 • Powered by Solana & IPFS
        </p>
        <p className="text-sm">
          Building a decentralized and transparent complaint resolution system
        </p>
      </Layout.Footer>
    </Layout>
  );
}
