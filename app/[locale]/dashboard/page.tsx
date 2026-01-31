"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TradeTableReview } from "./components/tables/trade-table-review";
import { AccountsOverview } from "./components/accounts/accounts-overview";
import WidgetCanvas from "./components/widget-canvas";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { clearReferralCode } from "@/lib/referral-storage";
import Link from "next/link";
import { cn } from "@/lib/utils";


export default function Home() {
  const searchParams = useSearchParams();

  // Clear referral code after successful subscription
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      clearReferralCode();
    }
  }, [searchParams]);

  const activeTab = searchParams.get("tab") || "widgets";

  return (
    <div className="w-full h-full relative">
      <Tabs value={activeTab} className="w-full h-full relative z-10">


        <TabsContent value="table" className="h-[calc(100vh-120px)] p-4 mt-2">
          <div className="w-full h-full glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <TradeTableReview />
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="flex-1 mt-2 p-4">
          <AccountsOverview size="large" />
        </TabsContent>

        <TabsContent value="widgets" className="px-4 mt-2">
          <WidgetCanvas />
        </TabsContent>
      </Tabs>
    </div>
  );
}



