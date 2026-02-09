import React, { useState, useEffect, useMemo } from 'react';
import { Button, Tooltip, Drawer } from 'antd';
import { MenuOutlined, CloseOutlined, HomeOutlined, FormOutlined, InfoCircleOutlined, DashboardOutlined, GlobalOutlined } from '@ant-design/icons';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { getWalletBalance } from '../utils/solana';
import { SOLANA_NETWORK } from '../utils/constants';
import { useRole } from '../hooks/useRole';
import { useLanguage } from '../context/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/router';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: <HomeOutlined /> },
  { href: '/#file-complaint', label: 'File Complaint', icon: <FormOutlined /> },
  { href: '/about', label: 'About', icon: <InfoCircleOutlined /> },
];

const Header = () => {
  const { publicKey } = useWallet();
  const { isAdmin, isConnected, role } = useRole();
  const { t, language, toggleLanguage } = useLanguage();
  const router = useRouter();
  const [balance, setBalance] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_ITEMS_DYNAMIC = useMemo(() => [
    { href: '/', label: t('home'), icon: <HomeOutlined /> },
    { href: '/#file-complaint', label: t('fileComplaint'), icon: <FormOutlined /> },
    { href: '/about', label: t('about'), icon: <InfoCircleOutlined /> },
  ], [t]);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    let cancelled = false;
    const fetchBalance = async () => {
      const bal = await getWalletBalance(publicKey);
      if (!cancelled) setBalance(bal);
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicKey]);

  const shortAddress = useMemo(() => {
    if (!publicKey) return '';
    const addr = publicKey.toString();
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  }, [publicKey]);

  const isActive = (href) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname === href || router.asPath === href;
  };

  return (
    <>
      {/* Skip to content - accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/90 backdrop-blur-xl no-print" role="banner">
        <div className="page-container flex h-16 items-center justify-between gap-2">
          {/* Left — Brand */}
          <Link href="/" className="flex items-center gap-3 no-underline group" aria-label="CivicPulse - Home">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-700 text-white text-lg font-bold shadow-sm group-hover:shadow-md transition-shadow" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V7l7-4 7 4v14" />
                <path d="M9 21v-6h6v6" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-900 leading-tight m-0" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
                CivicPulse
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-[11px] text-slate-400 leading-none m-0">
                  {t('poweredBy')}
                </p>
                <span className={`network-badge ${SOLANA_NETWORK === 'mainnet-beta' ? 'network-mainnet' : 'network-devnet'}`}>
                  {SOLANA_NETWORK === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
                </span>
              </div>
            </div>
          </Link>

          {/* Center — Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS_DYNAMIC.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline
                  ${isActive(item.href)
                    ? 'text-red-800 bg-red-50'
                    : 'text-slate-600 hover:text-red-800 hover:bg-red-50/50'
                  }
                `}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <span className="text-base" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            {/* Admin nav — only visible to admin wallet */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline
                  ${isActive('/admin')
                    ? 'text-red-800 bg-red-50'
                    : 'text-slate-600 hover:text-red-800 hover:bg-red-50/50'
                  }
                `}
                aria-current={isActive('/admin') ? 'page' : undefined}
              >
                <span className="text-base" aria-hidden="true"><DashboardOutlined /></span>
                {t('admin')}
              </Link>
            )}
          </nav>

          {/* Right — Language Toggle + Wallet + Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
            {/* Language Toggle Button */}
            <Tooltip title={language === 'en' ? 'नेपालीमा हेर्नुहोस्' : 'View in English'}>
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all cursor-pointer text-xs font-semibold"
                aria-label={language === 'en' ? 'Switch to Nepali' : 'Switch to English'}
              >
                <GlobalOutlined className="text-sm" />
                <span className="hidden sm:inline">{t('language')}</span>
              </button>
            </Tooltip>
            {/* Wallet info (desktop) */}
            {publicKey && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-label="Wallet connected" />
                <Tooltip title={publicKey.toString()}>
                  <span className="text-xs font-mono text-slate-500">{shortAddress}</span>
                </Tooltip>
                {/* Role badge */}
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  isAdmin
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {isAdmin ? 'Admin' : 'User'}
                </span>
                {balance !== null && (
                  <>
                    <span className="w-px h-4 bg-slate-200" aria-hidden="true" />
                    <span className="text-xs font-semibold text-emerald-600">
                      {balance.toFixed(2)} SOL
                    </span>
                  </>
                )}
              </div>
            )}

            <WalletMultiButton />

            {/* Mobile menu button */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <MenuOutlined className="text-lg" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-700 text-white text-sm font-bold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
              CivicPulse
            </span>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        className="md:hidden"
      >
        <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
          {NAV_ITEMS_DYNAMIC.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors no-underline
                ${isActive(item.href)
                  ? 'text-red-800 bg-red-50'
                  : 'text-slate-700 hover:text-red-800 hover:bg-red-50'
                }
              `}
            >
              <span className="text-lg" aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          {/* Admin nav — only visible to admin wallet in mobile too */}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors no-underline
                ${isActive('/admin')
                  ? 'text-red-800 bg-red-50'
                  : 'text-slate-700 hover:text-red-800 hover:bg-red-50'
                }
              `}
            >
              <span className="text-lg" aria-hidden="true"><DashboardOutlined /></span>
              {t('admin')}
            </Link>
          )}

          {/* Language toggle in mobile menu */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-slate-700 hover:text-red-800 hover:bg-red-50 cursor-pointer bg-transparent border-0 w-full text-left"
          >
            <span className="text-lg" aria-hidden="true"><GlobalOutlined /></span>
            {language === 'en' ? 'नेपालीमा हेर्नुहोस्' : 'View in English'}
          </button>
        </nav>

        {/* Mobile wallet info */}
        {publicKey && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">{t('connectedWallet')}</p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-mono text-slate-600">{shortAddress}</span>
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                isAdmin
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isAdmin ? 'Admin' : 'User'}
              </span>
              {balance !== null && (
                <>
                  <span className="ml-auto text-xs font-semibold text-emerald-600">
                    {balance.toFixed(2)} SOL
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Network info */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-slate-400">{t('network')}:</span>
          <span className={`network-badge ${SOLANA_NETWORK === 'mainnet-beta' ? 'network-mainnet' : 'network-devnet'}`}>
            {SOLANA_NETWORK === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
          </span>
        </div>
      </Drawer>
    </>
  );
};

export default Header;
