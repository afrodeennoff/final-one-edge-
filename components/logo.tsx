import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 255 255" xmlns="http://www.w3.org/2000/svg" className={cn("", className)}>
            <path fillRule="evenodd" clipRule="evenodd" d="M159 63L127.5 0V255H255L236.5 218H159V63Z" />
            <path fillRule="evenodd" clipRule="evenodd" d="M-3.05176e-05 255L127.5 -5.96519e-06L127.5 255L-3.05176e-05 255ZM64 217L121 104L121 217L64 217Z" />
        </svg>

    )
}

export function LogoText() {
    return (
        <span className="text-lg font-bold tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-600 dark:from-white dark:to-zinc-400 font-sans">
            Quntedge
        </span>
    )
}
