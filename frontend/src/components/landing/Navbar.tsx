import React, { useState, useEffect } from 'react';
import { Shield, Menu, X, ArrowRight, Lock, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { StatusIndicator } from '../../design-system/components/StatusIndicator';
import { Badge } from '../../design-system/components/Badge';
import { useAuth } from '../../context/AuthContext';

export interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenPortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenPortal }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Privacy & Security', href: '#privacy' },
    { label: 'Technology', href: '#technology' },
    { label: 'Mission', href: '#mission' },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-void/90 backdrop-blur-md border-b border-border-default shadow-subtle py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Identifier */}
        <a href="#hero" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand-500/10 text-brand-400 border border-brand-500/30 group-hover:border-brand-500/60 group-hover:shadow-brand-glow transition-all">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-sm tracking-tight text-slate-100 group-hover:text-brand-300 transition-colors">
                SHTKS SOVEREIGN
              </span>
              <span className="hidden sm:inline-flex rounded-full bg-shield-500/15 px-1.5 py-0.2 text-[9px] font-mono text-shield-300 border border-shield-500/30">
                SDG-COMMUNITY
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 leading-none">
              Privacy-Preserving Recommender
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="text-xs font-medium text-slate-300 hover:text-slate-100 transition-colors tracking-wide hover:underline underline-offset-8 decoration-brand-500/50"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <StatusIndicator
            status="online"
            label="CKKS-128b"
            subtext="Zero Cleartext"
            className="hidden xl:inline-flex py-1 px-2.5"
          />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Badge variant={user.role === 'admin' ? 'danger' : 'verified'}>
                {user.role.toUpperCase()}
              </Badge>

              {onOpenPortal && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onOpenPortal}
                  leftIcon={<LayoutDashboard className="h-3.5 w-3.5" />}
                >
                  My Portal
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                leftIcon={<LogOut className="h-3.5 w-3.5" />}
                title="Sign Out"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenAuth('login')}
                leftIcon={<Lock className="h-3.5 w-3.5" />}
              >
                Sign In
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => onOpenAuth('register')}
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 sm:hidden">
          {isAuthenticated && onOpenPortal ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenPortal}
              className="px-2.5 text-xs font-mono"
            >
              Portal
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenAuth('login')}
              className="px-2.5"
            >
              Sign In
            </Button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-sm text-slate-400 hover:text-slate-100 hover:bg-void-elevated transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-border-default bg-void-surface/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2 pt-1 pb-3 border-b border-border-subtle">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="px-3 py-2 text-sm font-medium text-slate-200 hover:bg-void-elevated rounded-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                {onOpenPortal && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenPortal();
                    }}
                  >
                    Open {user?.role.toUpperCase()} Portal
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center text-status-danger"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
