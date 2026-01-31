
import React from 'react';
import { motion, Variants } from 'framer-motion';

const Differentiators: React.FC = () => {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        },
    };

    return (
        <section className="py-fluid-xl px-fluid-sm bg-black relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
            <div className="container-fluid relative z-10">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-fluid-2xl md:text-fluid-4xl font-bold mb-fluid-xs tracking-tight text-white"
                    >
                        The Qunt Edge Difference
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-500 max-w-2xl mx-auto text-lg"
                    >
                        Most journals are just expensive spreadsheets. We built a behavioral correction engine.
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {[
                        {
                            title: "Measure What Matters",
                            desc: "Execution quality over outcomes. You can lose money and improve. You can make money and still be exposed. We differentiate luck from skill."
                        },
                        {
                            title: "Session-First Analysis",
                            desc: "Traders break over sessions, not single trades. We analyze decision sequences and emotional drift across time to find your breaking point."
                        },
                        {
                            title: "Psychology as Data",
                            desc: "No 'how did you feel' essays. We correlate specific emotional states with hard execution metrics and RR respect to find patterns."
                        },
                        {
                            title: "Opinionated Structure",
                            desc: "Intentionally limited to force clarity. Clarity forces discipline. No chaos, no over-analysis, no useless metrics. Just signal."
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="flex flex-col p-6 rounded-2xl border border-transparent hover:border-white/5 cursor-default group"
                        >
                            <div className="text-teal-500 mono mb-4 text-xs font-bold tracking-tighter uppercase flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                                Methodology 0{i + 1}
                            </div>
                            <h3 className="text-xl font-bold mb-3 tracking-tight text-white group-hover:text-teal-50 transition-colors">{item.title}</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed font-light group-hover:text-zinc-400 transition-colors">{item.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Differentiators;
