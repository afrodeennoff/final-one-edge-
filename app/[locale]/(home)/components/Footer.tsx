
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="py-12 px-6 border-t border-white/5 bg-[#050505]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center font-bold text-black text-xs">D</div>
                    <span className="text-sm font-bold tracking-tighter uppercase mono">Deltalytix</span>
                </div>

                <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Security</a>
                    <a href="#" className="hover:text-white transition-colors">API Docs</a>
                </div>

                <div className="text-[10px] mono text-zinc-600">
                    © {new Date().getFullYear()} Deltalytix. All rights reserved. Professional trading analytics.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
