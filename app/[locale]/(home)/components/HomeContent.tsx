
'use client';

import React from 'react';
import Navigation from './Navigation';
import Hero from './Hero';
import ProblemStatement from './ProblemStatement';
import AnalysisDemo from './AnalysisDemo';
import Differentiators from './Differentiators';
import HowItWorks from './HowItWorks';
import Features from './Features';
import Qualification from './Qualification';
import CTA from './CTA';
import Footer from './Footer';
import { useRouter } from 'next/navigation';

export default function HomeContent() {
    const router = useRouter();

    const handleLogin = () => {
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen flex flex-col selection:bg-teal-500/30 relative bg-[#050505] text-white overflow-x-hidden landing-scrollbar font-sans">
            <div className="fixed inset-0 grid-pattern pointer-events-none opacity-50"></div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="noise"></div>

            <Navigation onAccessPortal={handleLogin} />
            <main className="flex-grow relative z-10 w-full max-w-nones">
                <Hero onStart={handleLogin} />
                <ProblemStatement />
                <AnalysisDemo />
                <Differentiators />
                <HowItWorks />
                <Features />
                <Qualification />
                <CTA onStart={handleLogin} />
            </main>
            <Footer />
        </div>
    );
}
