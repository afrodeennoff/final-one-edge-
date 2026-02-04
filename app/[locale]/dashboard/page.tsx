"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { clearReferralCode } from "@/lib/referral-storage";
import { cn } from "@/lib/utils";
import TradingJournal from "./components/trading-journal/trading-journal";
import DashboardAnalytics from "./components/dashboard-analytics";
import TradingPerformance from "./components/trading-performance";
import MultiBrokerSync from "./components/multi-broker-sync";

export default function Home() {
  const searchParams = useSearchParams();

  // Clear referral code after successful subscription
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      clearReferralCode();
    }
  }, [searchParams]);

  const activeTab = searchParams.get("tab") || "journal";

  return (
    <div className="w-full h-full relative">
      <Tabs value={activeTab} className="w-full h-full relative z-10">
        <TabsContent value="journal" className="h-[calc(100vh-120px)] p-4 mt-2">
          <div className="w-full h-full glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <TradingJournal />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="h-[calc(100vh-120px)] p-4 mt-2">
          <div className="w-full h-full glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <DashboardAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="h-[calc(100vh-120px)] p-4 mt-2">
          <div className="w-full h-full glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <TradingPerformance />
          </div>
        </TabsContent>

        <TabsContent value="sync" className="h-[calc(100vh-120px)] p-4 mt-2">
          <div className="w-full h-full glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <MultiBrokerSync />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}