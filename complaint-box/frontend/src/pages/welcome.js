import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import {
  FileTextOutlined,
  CloudUploadOutlined,
  LikeOutlined,
  EyeOutlined,
  WalletOutlined,
  FormOutlined,
  TeamOutlined,
  RocketOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const WalletMultiButton = dynamic(
  () =>
    import('@solana/wallet-adapter-react-ui').then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const FEATURES = [
  {
    icon: <FileTextOutlined className="text-3xl" />,
    title: 'File Complaints',
    description:
      'Submit civic complaints about infrastructure, safety, and public services directly on-chain with full transparency.',
  },
  {
    icon: <CloudUploadOutlined className="text-3xl" />,
    title: 'IPFS Storage',
    description:
      'All evidence and attachments are stored on IPFS, ensuring permanent, censorship-resistant data availability.',
  },
  {
    icon: <LikeOutlined className="text-3xl" />,
    title: 'Community Upvoting',
    description:
      'Citizens upvote complaints to surface the most critical issues, giving power back to the community.',
  },
  {
    icon: <EyeOutlined className="text-3xl" />,
    title: 'Transparent Tracking',
    description:
      'Track every complaint from submission to resolution with an immutable, publicly auditable status history.',
  },
];

const STEPS = [
  {
    number: '01',
    icon: <WalletOutlined className="text-4xl" />,
    title: 'Connect Wallet',
    description: 'Link your Phantom or Solflare wallet to authenticate on the Solana network.',
  },
  {
    number: '02',
    icon: <FormOutlined className="text-4xl" />,
    title: 'File a Complaint',
    description: 'Describe your civic issue, attach evidence, and submit it on-chain.',
  },
  {
    number: '03',
    icon: <TeamOutlined className="text-4xl" />,
    title: 'Community Upvotes & Resolution',
    description: 'The community upvotes critical issues and admins resolve them transparently.',
  },
];

const TECH_STACK = [
  { name: 'Solana', color: 'from-purple-500 to-blue-500' },
  { name: 'IPFS', color: 'from-teal-400 to-cyan-500' },
  { name: 'Next.js', color: 'from-gray-200 to-gray-400' },
  { name: 'Anchor', color: 'from-orange-400 to-red-500' },
  { name: 'Phantom', color: 'from-violet-500 to-purple-600' },
];

/* ──────────────────── Sub-components ──────────────────── */

function FeatureCard({ icon, title, description, index }) {
  return (
    <div
      className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6
                 hover:border-purple-500/40 hover:bg-white/10 transition-all duration-300
                 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/20">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({ number, icon, title, description }) {
  return (
    <div className="relative flex flex-col items-center text-center px-4">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-purple-400 transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/20">
        {icon}
      </div>
      <span className="mb-1 text-xs font-bold tracking-widest text-purple-400 uppercase">
        Step {number}
      </span>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-400 max-w-xs">{description}</p>
    </div>
  );
}

function TechBadge({ name, color }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-gradient-to-r ${color} px-5 py-2 text-sm font-semibold text-white shadow-md transition-transform duration-200 hover:scale-105`}
    >
      {name}
    </span>
  );
}

/* ──────────────────── Splash Intro ──────────────────── */

function SplashIntro({ onContinue }) {
  const handleContinue = () => {
    // Set cookie so middleware won't redirect again
    document.cookie = 'civic_welcomed=1; path=/; max-age=31536000; SameSite=Lax';
    onContinue();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a14] text-white overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-purple-700/25 blur-[180px] animate-pulse" />
        <div className="absolute top-0 right-0 h-[350px] w-[350px] rounded-full bg-blue-700/20 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-cyan-700/15 blur-[120px]" />
      </div>

      {/* Decorative grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Badge */}
        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-2 text-sm font-medium tracking-wide text-purple-300 backdrop-blur animate-[fadeInDown_0.8s_ease-out]">
          <RocketOutlined /> Decentralized &amp; Transparent
        </span>

        {/* Greeting */}
        <p className="mb-3 text-lg text-gray-400 tracking-wide animate-[fadeIn_1s_ease-out]">
          Welcome to
        </p>

        {/* Title */}
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl md:text-8xl animate-[fadeIn_1.2s_ease-out]">
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Civic Complaint Box
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-12 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg animate-[fadeIn_1.5s_ease-out]">
          A citizen-powered platform on{' '}
          <span className="text-purple-300 font-medium">Solana</span> blockchain to
          report civic issues, upvote community problems, and track resolutions
          with full transparency.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleContinue}
          className="group relative rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-10 py-4 text-lg font-semibold text-white shadow-xl shadow-purple-600/30 transition-all duration-300 hover:shadow-purple-600/50 hover:scale-[1.04] animate-[fadeInUp_1.8s_ease-out]"
        >
          <span className="flex items-center gap-2">
            Click to Explore
            <ArrowRightOutlined className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </button>

        {/* Tiny hint */}
        <p className="mt-6 text-xs text-gray-600 animate-[fadeIn_2.5s_ease-out]">
          Powered by Solana &bull; IPFS &bull; Next.js
        </p>
      </div>

      {/* Keyframe styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ──────────────────── Main Page ──────────────────── */

export default function WelcomePage() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <Head>
        <title>Welcome — Civic Complaint Box</title>
        <meta
          name="description"
          content="A decentralized civic complaint system powered by Solana and IPFS."
        />
      </Head>

      {/* ─── Full-screen Splash Intro ─── */}
      {showSplash && <SplashIntro onContinue={() => setShowSplash(false)} />}

      {/* ─── Main landing content (visible after splash) ─── */}
      {!showSplash && (
      <div className="min-h-screen bg-[#0a0a14] text-white overflow-x-hidden">
        {/* ─── Ambient background blobs ─── */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-700/20 blur-[160px]" />
          <div className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-blue-700/20 blur-[140px]" />
          <div className="absolute bottom-0 left-1/4 h-[350px] w-[350px] rounded-full bg-indigo-700/15 blur-[130px]" />
        </div>

        {/* ═══════════════════ HERO ═══════════════════ */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
          {/* Decorative grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-medium tracking-wide text-purple-300 backdrop-blur">
            <RocketOutlined /> Built on Solana
          </span>

          <h1 className="mb-6 max-w-3xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl md:text-7xl">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Civic Complaint Box
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl">
            A decentralized civic complaint system powered by{' '}
            <span className="text-purple-300">Solana</span> and{' '}
            <span className="text-cyan-300">IPFS</span> that brings transparency
            and accountability to public issues.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <WalletMultiButton
              className="!rounded-xl !bg-gradient-to-r !from-purple-600 !to-blue-600 !px-8 !py-3 !text-base !font-semibold !shadow-lg !shadow-purple-600/30 hover:!shadow-purple-600/50 !transition-shadow !duration-300"
            />
            <button
              onClick={() => router.push('/')}
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-3 text-base font-semibold backdrop-blur transition-all duration-300 hover:border-purple-500/40 hover:bg-white/10"
            >
              View Complaints <ArrowRightOutlined className="ml-1" />
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 flex flex-col items-center gap-2 text-gray-500">
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <div className="h-8 w-[1px] animate-pulse bg-gradient-to-b from-gray-500 to-transparent" />
          </div>
        </section>

        {/* ═══════════════════ FEATURES ═══════════════════ */}
        <section className="mx-auto max-w-6xl px-6 py-28">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Platform Features
            </span>
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-gray-400">
            Everything you need to report, track, and resolve civic issues — decentralized.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} index={i} {...f} />
            ))}
          </div>
        </section>

        {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
        <section className="mx-auto max-w-5xl px-6 py-28">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-gray-400">
            Three simple steps to make your voice heard on the blockchain.
          </p>

          <div className="grid gap-12 sm:grid-cols-3">
            {STEPS.map((s) => (
              <StepCard key={s.number} {...s} />
            ))}
          </div>

          {/* Connector lines (visible on sm+ screens) */}
          <div className="mt-[-150px] hidden sm:flex items-start justify-center">
            <div className="mx-auto flex w-full max-w-md items-center">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
            </div>
          </div>
        </section>

        {/* ═══════════════════ TECHNOLOGY ═══════════════════ */}
        <section className="mx-auto max-w-4xl px-6 py-28">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Powered By
            </span>
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-gray-400">
            Best-in-class Web3 technologies for performance, security, and decentralization.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {TECH_STACK.map((tech) => (
              <TechBadge key={tech.name} {...tech} />
            ))}
          </div>
        </section>

        {/* ═══════════════════ CALL TO ACTION ═══════════════════ */}
        <section className="mx-auto max-w-3xl px-6 py-28 text-center">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-md sm:p-16">
            <CheckCircleOutlined className="mb-6 text-5xl text-purple-400" />
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Ready to Make a Difference?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-lg text-gray-400">
              Start reporting civic issues and make your community better.
              Every complaint matters when it lives on the blockchain.
            </p>
            <button
              onClick={() => router.push('/')}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-10 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-600/30 transition-all duration-300 hover:shadow-purple-600/50 hover:scale-[1.03]"
            >
              Go to Complaint Feed <ArrowRightOutlined className="ml-1" />
            </button>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="border-t border-white/5 py-8 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Civic Complaint Box — Decentralized &amp; Transparent
        </footer>
      </div>
      )}
    </>
  );
}
