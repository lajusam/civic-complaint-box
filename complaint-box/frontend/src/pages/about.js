import React from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import {
  SafetyCertificateOutlined,
  TeamOutlined,
  EyeOutlined,
  LockOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';

const Header = dynamic(() => import('../components/Header'), { ssr: false });

const FEATURES = [
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Blockchain Verified',
    description: 'Every complaint is recorded on the Solana blockchain, making it tamper-proof and permanently verifiable by anyone.',
    color: '#003893',
    bg: '#eef3ff',
  },
  {
    icon: <CloudOutlined />,
    title: 'IPFS Storage',
    description: 'Complaint data and evidence are stored on IPFS, ensuring decentralized and censorship-resistant access.',
    color: '#059669',
    bg: '#ecfdf5',
  },
  {
    icon: <EyeOutlined />,
    title: 'Full Transparency',
    description: 'Track the status of every complaint in real-time. All actions are public and auditable by the community.',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    icon: <TeamOutlined />,
    title: 'Community Driven',
    description: 'Upvote complaints that matter to you. The community decides which issues deserve priority attention.',
    color: '#ea580c',
    bg: '#fff7ed',
  },
  {
    icon: <LockOutlined />,
    title: 'Privacy First',
    description: 'Your wallet address is your identity. No personal information is collected or required to participate.',
    color: '#dc2626',
    bg: '#fef2f2',
  },
  {
    icon: <ThunderboltOutlined />,
    title: 'Fast & Low Cost',
    description: 'Built on Solana for sub-second finality and near-zero transaction fees. Civic action should be accessible to all.',
    color: '#0ea5e9',
    bg: '#f0f9ff',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Connect Your Wallet',
    description: 'Use Phantom or any Solana-compatible wallet. Your wallet is only needed when submitting or upvoting.',
  },
  {
    number: '02',
    title: 'File a Complaint',
    description: 'Describe the civic issue with a title, category, location, and optional photo evidence.',
  },
  {
    number: '03',
    title: 'On-Chain Submission',
    description: 'Your complaint is recorded on Solana and stored on IPFS — permanent and transparent.',
  },
  {
    number: '04',
    title: 'Community Action',
    description: 'Other citizens upvote, authorities track and update status. Full accountability loop.',
  },
];

export default function About() {
  return (
    <>
      <Head>
        <title>About — CivicPulse</title>
        <meta
          name="description"
          content="Learn how Civic Complaint Box uses Solana blockchain and IPFS to create a transparent, tamper-proof civic complaint management platform."
        />
      </Head>

      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />

        {/* Hero */}
        <section className="hero-gradient hero-pattern text-white">
          <div className="page-container py-14 sm:py-20 text-center">
            <h1
              className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight"
              style={{ fontFamily: 'Poppins, Inter, sans-serif' }}
            >
              Transparent Civic Action,
              <br />
              <span className="hero-heading-accent">Powered by Blockchain.</span>
            </h1>
            <p className="hero-subtext text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              CivicPulse is a decentralized platform that empowers citizens to report civic
              issues, track their resolution, and hold authorities accountable — all permanently
              recorded on the Solana blockchain.
            </p>
            <Link href="/">
              <Button
                type="primary"
                size="large"
                className="!bg-white !text-red-900 !border-white hover:!bg-red-50 !font-bold !shadow-lg !h-12 !px-8"
              >
                Start Filing Complaints <ArrowRightOutlined />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="page-container py-14" aria-labelledby="features-heading">
          <div className="text-center mb-10">
            <h2
              id="features-heading"
              className="text-2xl font-bold text-slate-900 mb-2"
              style={{ fontFamily: 'Poppins, Inter, sans-serif' }}
            >
              Why CivicPulse?
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              Traditional complaint systems lack transparency and accountability. We change that with
              blockchain technology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="glass-card p-6 animate-fade-in-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-xl"
                  style={{ background: feature.bg, color: feature.color }}
                  aria-hidden="true"
                >
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed m-0">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white border-y border-slate-200 py-14" aria-labelledby="how-heading">
          <div className="page-container">
            <div className="text-center mb-10">
              <h2
                id="how-heading"
                className="text-2xl font-bold text-slate-900 mb-2"
                style={{ fontFamily: 'Poppins, Inter, sans-serif' }}
              >
                How It Works
              </h2>
              <p className="text-slate-500 text-sm max-w-lg mx-auto">
                Filing a complaint takes less than a minute. Here's the simple process.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {STEPS.map((step, idx) => (
                <div key={idx} className="text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold"
                    style={{ background: '#fef2f4', color: '#DC143C', fontFamily: 'Poppins, Inter, sans-serif' }}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed m-0">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="page-container py-14" aria-labelledby="tech-heading">
          <div className="text-center mb-8">
            <h2
              id="tech-heading"
              className="text-2xl font-bold text-slate-900 mb-2"
              style={{ fontFamily: 'Poppins, Inter, sans-serif' }}
            >
              Built With
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            {['Solana', 'Anchor', 'IPFS / Pinata', 'Next.js', 'React', 'Tailwind CSS', 'Ant Design', 'Phantom Wallet'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-red-300 hover:bg-red-50 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="hero-gradient text-white py-14">
          <div className="page-container text-center">
            <h2
              className="text-2xl font-bold mb-3"
              style={{ fontFamily: 'Poppins, Inter, sans-serif' }}
            >
              Ready to Make a Difference?
            </h2>
            <p className="hero-subtext text-sm max-w-md mx-auto mb-6">
              Join your community in creating a more transparent and accountable civic system.
            </p>
            <Link href="/">
              <Button
                type="primary"
                size="large"
                className="!bg-white !text-red-900 !border-white hover:!bg-red-50 !font-bold !shadow-lg"
              >
                File a Complaint Now <ArrowRightOutlined />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white" role="contentinfo">
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
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <SafetyCertificateOutlined /> Powered by Solana
                </span>
                <span className="w-px h-3 bg-slate-200" />
                <span>Stored on IPFS</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
