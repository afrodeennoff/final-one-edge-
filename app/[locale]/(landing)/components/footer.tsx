'use client'
import React from 'react';
import Link from 'next/link';
import { Logo } from "@/components/logo";
import { Github, Youtube, MessageSquare } from "lucide-react";
import { useI18n } from "@/locales/client";

export default function Footer() {
  const t = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 sm:py-16 px-4 sm:px-6 border-t border-white/5 bg-[#050505] text-zinc-400">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-12 mb-12">
          {/* Logo and Slogan */}
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Logo className='w-6 h-6 fill-white' />
              <span className="text-xl font-bold tracking-tighter text-white">Qunt Edge</span>
            </Link>
            <p className="text-sm max-w-xs">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/afrodeennoff/lassttry-edge-" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Github className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
                <span className="sr-only">YouTube</span>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="sr-only">Discord</span>
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t('footer.product.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="hover:text-white transition-colors">{t('footer.product.features')}</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">{t('footer.product.pricing')}</Link></li>
              <li><Link href="/propfirms" className="hover:text-white transition-colors">{t('footer.product.propfirms')}</Link></li>
              <li><Link href="/teams" className="hover:text-white transition-colors">{t('footer.product.teams')}</Link></li>
            </ul>
          </div>

          {/* Support & Company */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t('footer.product.support')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/support" className="hover:text-white transition-colors">{t('footer.product.support')}</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t('footer.company.title')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">{t('footer.company.about')}</Link></li>
              </ul>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t('footer.legal.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">{t('footer.legal.privacy')}</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">{t('footer.legal.terms')}</Link></li>
              <li><Link href="/disclaimers" className="hover:text-white transition-colors">{t('footer.legal.disclaimers')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs mono text-zinc-500">
            {t('footer.copyright', { year: currentYear.toString() })}
          </div>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
