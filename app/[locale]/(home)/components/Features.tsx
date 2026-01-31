
import React from 'react';
import { motion, Variants } from 'framer-motion';

const Features: React.FC = () => {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const features = [
        {
            title: "Real-time PnL",
            subtitle: "Advanced Analytics",
            desc: "Track your performance in real-time with customizable metrics. Visualize your equity curve and daily statistics instantly.",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
            )
        },
        {
            title: "Multi-Broker Sync",
            subtitle: "Universal Integration",
            desc: "Connect Tradovate, Rithmic, IBKR, or import CSVs. Our AI-powered parser handles any broker format automatically.",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            )
        },
        {
            title: "AI Insights",
            subtitle: "Automated Journaling",
            desc: "Leverage AI for sentiment analysis, pattern recognition, and intelligent field mapping for seamless data imports.",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            )
        },
        {
            title: "Interactive Dashboards",
            subtitle: "Custom Layouts",
            desc: "Drag-and-drop widget system allowing full control over your workspace. Create the perfect trading command center.",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            )
        },
        {
            title: "Internationalization",
            subtitle: "Global Support",
            desc: "Native support for multiple languages (EN/FR) and currencies. Locale-aware formatting for a truly global experience.",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )
        },
        {
            title: "Rich Journaling",
            subtitle: "Structured Data",
            desc: "Rich text editor with image resizing and table support. Document your edge with precision and clarity.",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            )
        }
    ];

    return (
        <section id="features" className="py-fluid-xl px-fluid-sm bg-[#030303] relative border-t border-white/5">
            <div id="data-import" className="absolute -top-32" />
            <div id="daily-performance" className="absolute -top-32" />
            <div id="ai-journaling" className="absolute -top-32" />
            <div className="container-fluid">
                <div className="mb-fluid-xl flex flex-col md:flex-row justify-between items-end gap-fluid-sm">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -15 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-fluid-2xl md:text-fluid-4xl font-bold tracking-tighter mb-fluid-xs text-white"
                        >
                            Powerful Trading Infrastructure
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-zinc-400 max-w-xl text-lg font-light leading-relaxed"
                        >
                            Built with a modern stack (Next.js 15, React 19) for speed and reliability.
                        </motion.p>
                    </div>
                    <div className="hidden md:block">
                        <div className="flex gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                            <span>Stack: Next.js 15</span>
                            <span>/</span>
                            <span>React 19</span>
                        </div>
                    </div>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid-fluid"
                >
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            variants={cardVariants}
                            whileHover={{ y: -5 }}
                            className="group relative p-8 bg-[#0a0a0a] rounded-xl border border-white/5 hover:border-teal-500/30 transition-all duration-300"
                        >
                            {/* Internal Glow */}
                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="w-24 h-24 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                            </div>

                            <div className="relative z-10">
                                <div className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-lg flex items-center justify-center text-zinc-400 mb-6 group-hover:text-teal-400 group-hover:border-teal-500/30 transition-colors">
                                    {f.icon}
                                </div>
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 group-hover:text-teal-500/70 transition-colors">{f.subtitle}</h4>
                                <h3 className="text-xl font-bold text-white tracking-tight mb-4">{f.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed font-light group-hover:text-zinc-400 transition-colors">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Features;
