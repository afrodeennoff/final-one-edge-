"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CloudUpload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  FileText,
  Database,
  Zap
} from "lucide-react";
import { useI18n } from "@/locales/client";

interface BrokerSyncStatus {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "syncing" | "error";
  lastSync?: Date;
  tradesSynced: number;
  apiKey?: string;
}

export default function MultiBrokerSync() {
  const t = useI18n();
  const [brokers, setBrokers] = useState<BrokerSyncStatus[]>([
    {
      id: "tradovate",
      name: "Tradovate",
      status: "connected",
      lastSync: new Date(Date.now() - 3600000),
      tradesSynced: 127,
      apiKey: "tv_************"
    },
    {
      id: "rithmic",
      name: "Rithmic",
      status: "syncing",
      lastSync: new Date(Date.now() - 7200000),
      tradesSynced: 89,
      apiKey: "rz_************"
    },
    {
      id: "ibkr",
      name: "Interactive Brokers",
      status: "disconnected",
      tradesSynced: 0
    }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);

  const getStatusIcon = (status: BrokerSyncStatus["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: BrokerSyncStatus["status"]) => {
    switch (status) {
      case "connected":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>;
      case "syncing":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Syncing</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Disconnected</Badge>;
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setBrokers(prev => prev.map(broker => ({
      ...broker,
      status: "connected",
      lastSync: new Date(),
      tradesSynced: broker.tradesSynced + Math.floor(Math.random() * 10) + 5
    })));
    setIsSyncing(false);
  };

  const handleConnectBroker = (brokerId: string) => {
    setBrokers(prev => prev.map(broker => 
      broker.id === brokerId 
        ? { ...broker, status: "syncing" }
        : broker
    ));
    
    // Simulate connection process
    setTimeout(() => {
      setBrokers(prev => prev.map(broker => 
        broker.id === brokerId 
          ? { 
              ...broker, 
              status: "connected",
              lastSync: new Date(),
              tradesSynced: Math.floor(Math.random() * 50) + 10
            }
          : broker
      ));
    }, 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multi-Broker Sync</h1>
          <p className="text-muted-foreground mt-2">
            Connect and synchronize your trading data from multiple brokers
          </p>
        </div>
        <Button 
          onClick={handleSyncAll} 
          disabled={isSyncing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync All Brokers'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {brokers.map((broker) => (
          <Card key={broker.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(broker.status)}
                  {broker.name}
                </CardTitle>
                {getStatusBadge(broker.status)}
              </div>
              {broker.apiKey && (
                <CardDescription className="text-sm">
                  API Key: {broker.apiKey}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Trades Synced</span>
                <span className="font-medium flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {broker.tradesSynced}
                </span>
              </div>
              
              {broker.lastSync && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Sync</span>
                  <span>
                    {broker.lastSync.toLocaleTimeString()}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex gap-2">
                {broker.status === "disconnected" ? (
                  <Button 
                    onClick={() => handleConnectBroker(broker.id)}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <Zap className="h-4 w-4" />
                    Connect
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleConnectBroker(broker.id)}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Resync
                  </Button>
                )}
                
                <Button variant="ghost" size="icon">
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Import History
          </CardTitle>
          <CardDescription>
            Recent synchronization activities and data imports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {brokers
              .filter(broker => broker.lastSync)
              .sort((a, b) => (b.lastSync?.getTime() || 0) - (a.lastSync?.getTime() || 0))
              .map((broker) => (
                <div key={broker.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(broker.status)}
                    <div>
                      <p className="font-medium">{broker.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {broker.tradesSynced} trades imported
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {broker.lastSync?.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {broker.lastSync?.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}