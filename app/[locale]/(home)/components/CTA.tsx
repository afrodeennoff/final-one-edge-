
import React from 'react';

interface CTAProps {
    onStart: () => void;
}

const CTA: React.FC<CTAProps> = ({ onStart }) => {
    return (
        <section className="py-fluid-xl px-fluid-sm bg-[#050505]">
            <div className="container-fluid max-w-4xl text-center">
                <h2 className="text-fluid-3xl md:text-fluid-5xl font-semibold tracking-tighter mb-fluid-sm text-white">
                    The market rewards <br />
                    <span className="text-teal-500">process, not luck.</span>
                </h2>
                <p className="text-zinc-400 text-lg mb-12 max-w-xl mx-auto leading-relaxed font-normal">
                    Start identifying the behavioral leakages that are draining your account. Qunt Edge is the clinical intelligence layer for your trading career.
                </p>
                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={onStart}
                        className="bg-teal-500 hover:bg-teal-400 text-black text-sm px-10 py-5 rounded-full font-bold uppercase tracking-widest transition-all hover:-translate-y-1 shadow-[0_0_30px_-5px_rgba(45,212,191,0.3)]"
                    >
                        Apply for Early Access
                    </button>
                    <p className="text-xs mono text-zinc-600">Limited availability to ensure quality support.</p>
                </div>
            </div>
        </section>
    );
};

export default CTA;
