'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Logo } from "@/components/logo"
import { Moon, Sun, FileText, Cpu, Users, Layers, BarChart3, Calendar, BookOpen, Database, LineChart, Menu, Globe, Laptop, Crown, Github } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useTheme } from '@/context/theme-provider'
import { cn } from '@/lib/utils'
import { useChangeLocale, useI18n } from "@/locales/client"
import { useRouter, usePathname } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useCurrentLocale } from '@/locales/client'
import { LanguageSelector } from "@/components/ui/language-selector"
import { useUserStore } from '@/store/user-store'

const ListItem = React.forwardRef<
    React.ComponentRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & {
        title: string;
        icon?: React.ReactNode;
    }
>(({ className, title, children, icon, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={`group flex min-h-[44px] select-none space-y-1 rounded-md p-3 leading-none no-underline transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-2 focus:outline-offset-2 focus:outline-ring active:scale-[0.98] ${className}`}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none flex items-start gap-2 flex-1">
                        {icon && <span className="mt-0.5 flex-shrink-0" aria-hidden="true">{icon}</span>}
                        <span className="flex-1">{title}</span>
                    </div>
                    {children && (
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-2">
                            {children}
                        </p>
                    )}
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"

const MobileNavItem = ({ href, children, onClick, className, isActive = false }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string; isActive?: boolean }) => (
    <li>
        <Link
            href={href}
            className={cn(
                "flex min-h-[44px] items-center py-3 px-4 rounded-md transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground focus:outline-2 focus:outline-offset-2 focus:outline-ring",
                "active:scale-[0.98]",
                isActive && "bg-accent text-accent-foreground font-medium",
                className
            )}
            onClick={onClick}
            aria-current={isActive ? "page" : undefined}
        >
            {children}
        </Link>
    </li>
)

// Animation variants for mobile menu
const listVariant = {
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
    hidden: {
        opacity: 0,
    },
}

const itemVariant = {
    hidden: {
        opacity: 0,
        y: 20
    },
    show: {
        opacity: 1,
        y: 0
    },
}

export default function Navbar() {
    const t = useI18n()
    const { theme, setTheme } = useTheme()
    const currentLocale = useCurrentLocale()
    const changeLocale = useChangeLocale()
    const pathname = usePathname()
    const user = useUserStore(state => state.supabaseUser)
    const [isOpen, setIsOpen] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    const closeMenu = () => {
        setIsOpen(false)
    }

    // Add/remove data attribute when mobile menu visibility changes
    useEffect(() => {
        if (isOpen) {
            document.body.setAttribute('data-mobile-navbar', 'open')
        } else {
            document.body.removeAttribute('data-mobile-navbar')
        }

        // Cleanup on unmount
        return () => {
            document.body.removeAttribute('data-mobile-navbar')
        }
    }, [isOpen])

    // Lock/unlock body scroll when mobile menu is open
    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.body.style.overflow = isOpen ? 'hidden' : ''
        }

        // Cleanup on unmount
        return () => {
            if (typeof window !== 'undefined') {
                document.body.style.overflow = ''
            }
        }
    }, [isOpen])

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100

                if (scrollPercent <= 25) {
                    setIsVisible(true)
                } else if (window.scrollY > lastScrollY) {
                    setIsVisible(false)
                } else {
                    setIsVisible(true)
                }

                setLastScrollY(window.scrollY)
            }
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar)

            return () => {
                window.removeEventListener('scroll', controlNavbar)
            }
        }
    }, [lastScrollY])


    const languages = [
        { value: 'en', label: 'English' },
        { value: 'fr', label: 'Français' },
        // Add more languages here
    ]

    const [themeOpen, setThemeOpen] = useState(false)
    const [languageOpen, setLanguageOpen] = useState(false)
    const handleThemeChange = (value: string) => {
        setTheme(value as "light" | "dark" | "system")
        setThemeOpen(false)
    }

    const handleLanguageChange = (value: string) => {
        changeLocale(value as "en" | "fr")
        setLanguageOpen(false)
    }

    const getThemeIcon = () => {
        if (theme === 'light') return <Sun className="h-5 w-5" />;
        if (theme === 'dark') return <Moon className="h-5 w-5" />;
        return <Laptop className="h-5 w-5" />;
    };

    const links = [
        {
            title: t('landing.navbar.features'),
            children: [
                {
                    path: "/#data-import",
                    title: t('landing.navbar.dataImport'),
                    icon: <Database className="h-4 w-4" />,
                },
                {
                    path: "/#performance-visualization",
                    title: t('landing.navbar.performanceVisualization'),
                    icon: <LineChart className="h-4 w-4" />,
                },
                {
                    path: "/#daily-performance",
                    title: t('landing.navbar.dailyPerformance'),
                    icon: <Calendar className="h-4 w-4" />,
                },
                {
                    path: "/#ai-journaling",
                    title: t('landing.navbar.aiJournaling'),
                    icon: <BookOpen className="h-4 w-4" />,
                },
                {
                    path: "/propfirms",
                    title: t('landing.navbar.propFirms'),
                    icon: <Layers className="h-4 w-4" />,
                },
            ],
        },
        {
            title: t('landing.navbar.pricing'),
            path: "/pricing",
        },
        {
            title: t('landing.navbar.updates'),
            children: [
                {
                    path: "/updates",
                    title: t('landing.navbar.productUpdates'),
                    icon: <BarChart3 className="h-4 w-4" />,
                },
                {
                    path: "/community",
                    title: t('landing.navbar.community'),
                    icon: <Users className="h-4 w-4" />,
                },
            ],
        },
    ]

    return (
        <>
            {/* Desktop hover backdrop */}
            <div className={`fixed inset-0 bg-background/80  backdrop-blur-xs z-40 transition-opacity duration-300 ${hoveredItem ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />

            <span className={`h-14 fixed top-0 left-0 right-0 bg-background z-50 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}></span>
            <header className={`max-w-7xl mx-auto fixed top-0 left-0 right-0 px-4 lg:px-6 h-14 flex items-center justify-between z-50  text-foreground transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                <Link href="/" className="flex items-center space-x-2">
                    <Logo className='w-6 h-6 fill-black dark:fill-white' />
                    <span className="font-bold text-xl">Qunt Edge</span>
                </Link>
                <div className="hidden lg:block">
                    <NavigationMenu>
                        <NavigationMenuList className="list-none">
                            <NavigationMenuItem onMouseEnter={() => setHoveredItem('features')} onMouseLeave={() => setHoveredItem(null)}>
                                <NavigationMenuTrigger className='bg-transparent'>{t('landing.navbar.features')}</NavigationMenuTrigger>
                                <NavigationMenuContent onMouseEnter={() => setHoveredItem('features')} onMouseLeave={() => setHoveredItem(null)}>
                                    <ul className="grid gap-3 p-6 md:w-[500px] lg:w-[600px] lg:grid-cols-[.75fr_1fr] list-none">
                                        <li className="row-span-3">
                                            <NavigationMenuLink asChild>
                                                <Link className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-6 no-underline outline-hidden focus:shadow-md" href="/">
                                                    <Logo className='w-6 h-6' />
                                                    <div className="mb-2 mt-4 text-lg font-medium">
                                                        Qunt Edge
                                                    </div>
                                                    <p className="text-sm leading-tight text-muted-foreground">
                                                        {t('landing.navbar.elevateTrading')}
                                                    </p>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                        <ListItem href="/#data-import" title={t('landing.navbar.dataImport')} icon={<Database className="h-4 w-4" />}>
                                            {t('landing.navbar.dataImportDescription')}
                                        </ListItem>
                                        <ListItem href="/#performance-visualization" title={t('landing.navbar.performanceVisualization')} icon={<LineChart className="h-4 w-4" />}>
                                            {t('landing.navbar.performanceVisualizationDescription')}
                                        </ListItem>
                                        <ListItem href="/#daily-performance" title={t('landing.navbar.dailyPerformance')} icon={<Calendar className="h-4 w-4" />}>
                                            {t('landing.navbar.dailyPerformanceDescription')}
                                        </ListItem>
                                        <div className='col-span-2 grid grid-cols-2 gap-3'>
                                            <ListItem href="/#ai-journaling" title={t('landing.navbar.aiJournaling')} icon={<BookOpen className="h-4 w-4" />}>
                                                {t('landing.navbar.aiJournalingDescription')}
                                            </ListItem>
                                            <ListItem href="/propfirms" title={t('landing.navbar.propFirms')} icon={<Layers className="h-4 w-4" />}>
                                                {t('landing.propfirms.description')}
                                            </ListItem>
                                        </div>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem onMouseEnter={() => setHoveredItem('pricing')} onMouseLeave={() => setHoveredItem(null)}>
                                <NavigationMenuTrigger className='bg-transparent'>{t('landing.navbar.pricing')}</NavigationMenuTrigger>
                                <NavigationMenuContent onMouseEnter={() => setHoveredItem('pricing')} onMouseLeave={() => setHoveredItem(null)}>
                                    <ul className="grid gap-3 p-6 md:w-[500px] lg:w-[600px] list-none">
                                        <ListItem href="#pricing" title={t('pricing.basic.name')} icon={<Sun className="h-4 w-4" />}>
                                            {t('pricing.basic.description')}
                                        </ListItem>
                                        <ListItem href="#pricing" title={t('pricing.plus.name')} icon={<Crown className="h-4 w-4" />}>
                                            {t('pricing.plus.description')}
                                        </ListItem>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem onMouseEnter={() => setHoveredItem('updates')} onMouseLeave={() => setHoveredItem(null)}>
                                <NavigationMenuTrigger className='bg-transparent'>{t('landing.navbar.updates')}</NavigationMenuTrigger>
                                <NavigationMenuContent onMouseEnter={() => setHoveredItem('updates')} onMouseLeave={() => setHoveredItem(null)}>
                                    <ul className="grid gap-3 p-4 md:w-[500px] lg:w-[600px] list-none">
                                        <ListItem href="/updates" title={t('landing.navbar.productUpdates')} icon={<BarChart3 className="h-4 w-4" />}>
                                            {t('landing.navbar.productUpdatesDescription')}
                                        </ListItem>
                                        <ListItem href="/community" title={t('landing.navbar.community')} icon={<Users className="h-4 w-4" />}>
                                            {t('landing.navbar.communityDescription')}
                                        </ListItem>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                        </NavigationMenuList>
                        <Separator orientation="vertical" className="h-6 mx-4" />
                        {!user && (
                            <Button variant="ghost" className="text-sm font-medium hover:text-accent-foreground" asChild>
                                <Link href={"/authentication"}>{t('landing.navbar.signIn')}</Link>
                            </Button>
                        )}
                    </NavigationMenu>
                </div>

                <div className="flex items-center space-x-4">
                    <LanguageSelector />
                    <Popover modal>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="hidden lg:inline-flex h-9 w-9 px-0">
                                {getThemeIcon()}
                                <span className="sr-only">{t('landing.navbar.toggleTheme')}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" align="end">
                            <Command>
                                <CommandList>
                                    <CommandGroup>
                                        <CommandItem onSelect={() => handleThemeChange("light")}>
                                            <Sun className="mr-2 h-4 w-4" />
                                            <span>{t('landing.navbar.lightMode')}</span>
                                        </CommandItem>
                                        <CommandItem onSelect={() => handleThemeChange("dark")}>
                                            <Moon className="mr-2 h-4 w-4" />
                                            <span>{t('landing.navbar.darkMode')}</span>
                                        </CommandItem>
                                        <CommandItem onSelect={() => handleThemeChange("system")}>
                                            <Laptop className="mr-2 h-4 w-4" />
                                            <span>{t('landing.navbar.systemTheme')}</span>
                                        </CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <button
                        type="button"
                        className="ml-auto lg:inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-3 rounded-md transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-2 focus:outline-offset-2 focus:outline-ring active:scale-95"
                        onClick={toggleMenu}
                        aria-expanded={isOpen}
                        aria-controls="mobile-menu"
                        aria-label={isOpen ? t('landing.navbar.closeMenu') : t('landing.navbar.openMenu')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={18}
                            height={13}
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                fill="currentColor"
                                d="M0 12.195v-2.007h18v2.007H0Zm0-5.017V5.172h18v2.006H0Zm0-5.016V.155h18v2.007H0Z"
                            />
                        </svg>
                    </button>
                </div>
            </header>

            {isOpen && (
                <motion.div
                    id="mobile-menu"
                    className="fixed bg-background -top-[2px] right-0 left-0 bottom-0 h-screen z-50 px-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{
                        duration: 0.3,
                        ease: "easeOut"
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-label={t('landing.navbar.mobileMenu')}
                >
                    <motion.div
                        className="mt-4 flex justify-between p-3 px-4 relative ml-px"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.3,
                            ease: "easeOut",
                            delay: 0.1
                        }}
                    >
                        <motion.button
                            type="button"
                            onClick={closeMenu}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                        >
                            <span className="sr-only">Qunt Edge Logo</span>
                            <Logo className='w-6 h-6 fill-black dark:fill-white' />
                        </motion.button>

                        <motion.button
                            type="button"
                            className="ml-auto lg:inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-3 absolute right-[10px] top-2 rounded-md transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-2 focus:outline-offset-2 focus:outline-ring active:scale-95"
                            onClick={closeMenu}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            aria-label={t('landing.navbar.closeMenu')}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                className="fill-primary"
                                aria-hidden="true"
                            >
                                <path fill="none" d="M0 0h24v24H0V0z" />
                                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                            </svg>
                        </motion.button>
                    </motion.div>

                    <div className="h-screen pb-[150px] overflow-auto">
                        <motion.ul
                            initial="hidden"
                            animate="show"
                            className="px-3 pt-8 text-xl text-[#878787] space-y-8 mb-8 overflow-auto"
                            variants={listVariant}
                        >
                            {links.map(({ path, title, children }, index) => {
                                const isActive = path === "/updates" ? pathname.includes("updates") : path === pathname;

                                if (path) {
                                    return (
                                        <motion.li variants={itemVariant} key={path}>
                                            <motion.div
                                                whileHover={{ x: 4 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Link
                                                    href={path}
                                                    className={cn(
                                                        "flex min-h-[44px] items-center py-3 px-2 rounded-md transition-all duration-200",
                                                        "hover:bg-accent hover:text-accent-foreground",
                                                        "focus:bg-accent focus:text-accent-foreground focus:outline-2 focus:outline-offset-2 focus:outline-ring",
                                                        "active:scale-[0.98]",
                                                        isActive && "bg-accent text-accent-foreground font-medium"
                                                    )}
                                                    onClick={closeMenu}
                                                    aria-current={isActive ? "page" : undefined}
                                                >
                                                    {title}
                                                </Link>
                                            </motion.div>
                                        </motion.li>
                                    );
                                }

                                return (
                                    <motion.li key={title} variants={itemVariant}>
                                        <Accordion collapsible type="single">
                                            <AccordionItem value={`item-${index}`} className="border-none">
                                                <AccordionTrigger className="flex items-center justify-between w-full font-normal p-0 hover:no-underline">
                                                    <span className="text-[#878787]">{title}</span>
                                                </AccordionTrigger>

                                                {children && (
                                                    <AccordionContent className="text-xl">
                                                        <motion.ul
                                                            className="space-y-8 ml-4 mt-6"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            {children.map((child, childIndex) => {
                                                                return (
                                                                    <motion.li
                                                                        key={child.path}
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{
                                                                            duration: 0.2,
                                                                            delay: childIndex * 0.05
                                                                        }}
                                                                    >
                                                                        <motion.div
                                                                            whileHover={{ x: 4 }}
                                                                            transition={{ duration: 0.2 }}
                                                                        >
                                                                            <Link
                                                                                onClick={closeMenu}
                                                                                href={child.path}
                                                                                className="flex min-h-[44px] items-center py-3 px-2 rounded-md transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-2 focus:outline-offset-2 focus:outline-ring active:scale-[0.98]"
                                                                            >
                                                                                <span>{child.icon}</span>
                                                                                <span>{child.title}</span>
                                                                            </Link>
                                                                        </motion.div>
                                                                    </motion.li>
                                                                );
                                                            })}
                                                        </motion.ul>
                                                    </AccordionContent>
                                                )}
                                            </AccordionItem>
                                        </Accordion>
                                    </motion.li>
                                );
                            })}

                            <motion.li
                                className="mt-auto border-t pt-8"
                                variants={itemVariant}
                            >
                                <Link
                                    className="text-xl text-primary"
                                    href="/authentication"
                                    onClick={closeMenu}
                                >
                                    {t('landing.navbar.signIn')}
                                </Link>
                            </motion.li>

                            <motion.li variants={itemVariant}>
                                <motion.div
                                    className="py-4 border-t"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeOut",
                                        delay: 0.2
                                    }}
                                >
                                    <Accordion collapsible type="single">
                                        <AccordionItem value="theme" className="border-none">
                                            <AccordionTrigger className="flex items-center justify-between w-full font-normal p-0 hover:no-underline">
                                                <span className="text-[#878787] flex items-center space-x-2">
                                                    <div className="flex items-center justify-center w-5 h-5">
                                                        <AnimatePresence mode="wait">
                                                            <motion.div
                                                                key={theme}
                                                                initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                                                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                                exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                                                                transition={{
                                                                    duration: 0.4,
                                                                    ease: "easeInOut"
                                                                }}
                                                                className="flex items-center justify-center"
                                                            >
                                                                {getThemeIcon()}
                                                            </motion.div>
                                                        </AnimatePresence>
                                                    </div>
                                                    <span>{t('landing.navbar.changeTheme')}</span>
                                                </span>
                                            </AccordionTrigger>
                                            <AccordionContent className="text-xl">
                                                <motion.ul
                                                    className="space-y-8 ml-4 mt-6"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <motion.li
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2, delay: 0.05 }}
                                                    >
                                                        <motion.div
                                                            whileHover={{ x: 4 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <button
                                                                onClick={() => handleThemeChange("light")}
                                                                className={`flex min-h-[44px] items-center py-3 px-2 rounded-md transition-all duration-200 hover:bg-accent focus:bg-accent focus:outline-2 focus:outline-offset-2 focus:outline-ring active:scale-[0.98] ${theme === 'light' ? 'bg-accent text-accent-foreground' : ''
                                                                    }`}
                                                                aria-pressed={theme === 'light'}
                                                            >
                                                                <Sun className="h-4 w-4" aria-hidden="true" />
                                                                <span className="ml-2">{t('landing.navbar.lightMode')}</span>
                                                                {theme === 'light' && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="ml-auto"
                                                                        aria-hidden="true"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </motion.div>
                                                                )}
                                                            </button>
                                                        </motion.div>
                                                    </motion.li>
                                                    <motion.li
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2, delay: 0.1 }}
                                                    >
                                                        <motion.div
                                                            whileHover={{ x: 4 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <button
                                                                onClick={() => handleThemeChange("dark")}
                                                                className={`flex min-h-[44px] items-center py-3 px-2 rounded-md transition-all duration-200 hover:bg-accent focus:bg-accent focus:outline-2 focus:outline-offset-2 focus:outline-ring active:scale-[0.98] ${theme === 'dark' ? 'bg-accent text-accent-foreground' : ''
                                                                    }`}
                                                                aria-pressed={theme === 'dark'}
                                                            >
                                                                <Moon className="h-4 w-4" aria-hidden="true" />
                                                                <span className="ml-2">{t('landing.navbar.darkMode')}</span>
                                                                {theme === 'dark' && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="ml-auto"
                                                                        aria-hidden="true"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </motion.div>
                                                                )}
                                                            </button>
                                                        </motion.div>
                                                    </motion.li>
                                                    <motion.li
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2, delay: 0.15 }}
                                                    >
                                                        <motion.div
                                                            whileHover={{ x: 4 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <button
                                                                onClick={() => handleThemeChange("system")}
                                                                className={`flex min-h-[44px] items-center py-3 px-2 rounded-md transition-all duration-200 hover:bg-accent focus:bg-accent focus:outline-2 focus:outline-offset-2 focus:outline-ring active:scale-[0.98] ${theme === 'system' ? 'bg-accent text-accent-foreground' : ''
                                                                    }`}
                                                                aria-pressed={theme === 'system'}
                                                            >
                                                                <Laptop className="h-4 w-4" aria-hidden="true" />
                                                                <span className="ml-2">{t('landing.navbar.systemTheme')}</span>
                                                                {theme === 'system' && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="ml-auto"
                                                                        aria-hidden="true"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </motion.div>
                                                                )}
                                                            </button>
                                                        </motion.div>
                                                    </motion.li>
                                                </motion.ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </motion.div>
                            </motion.li>
                        </motion.ul>
                    </div>
                </motion.div>
            )}

            {/* Mobile navbar overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-background z-40" />
            )}
        </>
    )
}