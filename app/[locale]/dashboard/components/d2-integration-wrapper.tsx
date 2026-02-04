"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Bot
} from "lucide-react";
import TradingJournal from './trading-journal/trading-journal';
import DashboardAnalytics from './dashboard-analytics';
import TradingPerformance from './trading-performance';
import MultiBrokerSync from './multi-broker-sync';

export default function D2IntegrationWrapper() {
  const [activeTab, setActiveTab] = useState("journal");

  return (
    <div className="w-full h-full relative">
      <Tabs value={activeTab} className="w-full h-full relative z-10">
        <div className="px-6 py-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger 
              value="journal" 
              onClick={() => setActiveTab("journal")}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Journal
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              onClick={() => setActiveTab("analytics")}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              onClick={() => setActiveTab("performance")}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="sync" 
              onClick={() => setActiveTab("sync")}
              className="flex items-center gap-2"
            >
              <Bot className="h-4 w-4" />
              Sync
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="journal" className="h-[calc(100vh-180px)] mt-0">
          <div className="w-full h-full p-6">
            <TradingJournal />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="h-[calc(100vh-180px)] mt-0">
          <div className="w-full h-full p-6">
            <DashboardAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="h-[calc(100vh-180px)] mt-0">
          <div className="w-full h-full p-6">
            <TradingPerformance />
          </div>
        </TabsContent>

        <TabsContent value="sync" className="h-[calc(100vh-180px)] mt-0">
          <div className="w-full h-full p-6">
            <MultiBrokerSync />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}