
import { setStaticParamsLocale } from "next-international/server";
import { getStaticParams } from "@/locales/server";
import HomeContent from "./components/HomeContent";
import { Metadata } from 'next';

export function generateStaticParams() {
    return getStaticParams();
}

export const metadata: Metadata = {
    title: 'Qunt Edge | Professional Trading Analytics',
    description: 'The clinical intelligence layer for professional discretionary traders. Stop auditing the money, audit the execution.',
};

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setStaticParamsLocale(locale);

    return <HomeContent />;
}
