import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  FileText, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign
} from "lucide-react";
import { useI18n } from "@/locales/client";

interface ImportStatus {
  id: string;
  fileName: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  tradesFound: number;
  tradesImported: number;
  errors: string[];
  createdAt: Date;
}

export default function D2ImportSystem() {
  const t = useI18n();
  const [imports, setImports] = useState<ImportStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImport: ImportStatus = {
      id: Date.now().toString(),
      fileName: files[0].name,
      status: "pending",
      progress: 0,
      tradesFound: 0,
      tradesImported: 0,
      errors: [],
      createdAt: new Date()
    };

    setImports(prev => [newImport, ...prev]);
    processFile(newImport.id, files[0]);
  };

  const processFile = async (importId: string, file: File) => {
    // Simulate file processing
    setImports(prev => prev.map(imp => 
      imp.id === importId ? { ...imp, status: "processing", progress: 25 } : imp
    ));

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setImports(prev => prev.map(imp => 
      imp.id === importId ? { ...imp, progress: 50, tradesFound: 42 } : imp
    ));

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setImports(prev => prev.map(imp => 
      imp.id === importId 
        ? { 
            ...imp, 
            status: "completed", 
            progress: 100, 
            tradesImported: 42,
            errors: []
          } 
        : imp
    ));
  };

  const getStatusIcon = (status: ImportStatus["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Database className="h-4 w-4 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ImportStatus["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case "processing":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Import</h1>
          <p className="text-muted-foreground mt-2">
            Import your trading data from various sources
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
              <input
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.json"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
            </label>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {imports.length === 0 ? (
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No imports yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Upload your trading data files to get started
              </p>
              <Button asChild>
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First File
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.json"
                    onChange={handleFileUpload}
                  />
                </label>
              </Button>
            </CardContent>
          </Card>
        ) : (
          imports.map((importItem) => (
            <Card key={importItem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(importItem.status)}
                    {importItem.fileName}
                  </CardTitle>
                  {getStatusBadge(importItem.status)}
                </div>
                <CardDescription>
                  Imported on {importItem.createdAt.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{importItem.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importItem.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Trades Found</span>
                    </div>
                    <span className="font-medium">{importItem.tradesFound}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Imported</span>
                    </div>
                    <span className="font-medium text-green-600">{importItem.tradesImported}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Errors</span>
                    </div>
                    <span className="font-medium text-red-600">{importItem.errors.length}</span>
                  </div>
                </div>

                {importItem.errors.length > 0 && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <h4 className="font-medium text-destructive mb-2">Errors:</h4>
                    <ul className="text-sm space-y-1">
                      {importItem.errors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}