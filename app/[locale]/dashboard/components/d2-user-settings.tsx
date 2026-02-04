'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Key,
  Save,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { useI18n } from "@/locales/client"
import { toast } from "sonner"

interface UserSettings {
  profile: {
    name: string
    email: string
    timezone: string
    currency: string
  }
  notifications: {
    email: boolean
    push: boolean
    dailySummary: boolean
    tradeAlerts: boolean
  }
  privacy: {
    dataSharing: boolean
    analytics: boolean
    marketing: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    language: string
    dateFormat: string
  }
}

export default function D2UserSettings() {
  const t = useI18n()
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: '',
      email: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: 'USD'
    },
    notifications: {
      email: true,
      push: true,
      dailySummary: true,
      tradeAlerts: true
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      marketing: false
    },
    appearance: {
      theme: 'system',
      language: 'en',
      dateFormat: 'MM/dd/yyyy'
    }
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user settings from API
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      // In real implementation, fetch from your API
      setSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          name: 'John Trader',
          email: 'john@example.com'
        }
      }))
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleProfileChange = (field: keyof UserSettings['profile'], value: string) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }))
  }

  const handleNotificationChange = (field: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }))
  }

  const handlePrivacyChange = (field: keyof UserSettings['privacy'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value
      }
    }))
  }

  const handleAppearanceChange = (field: keyof UserSettings['appearance'], value: string | 'light' | 'dark' | 'system') => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [field]: value
      }
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and settings</p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={settings.profile.timezone}
                    onChange={(e) => handleProfileChange('timezone', e.target.value)}
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Hong_Kong">Hong Kong</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <select
                    id="currency"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={settings.profile.currency}
                    onChange={(e) => handleProfileChange('currency', e.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about your trading activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get real-time alerts on your device</p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Daily Summary</Label>
                  <p className="text-sm text-muted-foreground">Receive daily performance summaries</p>
                </div>
                <Switch
                  checked={settings.notifications.dailySummary}
                  onCheckedChange={(checked) => handleNotificationChange('dailySummary', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Trade Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about significant trades</p>
                </div>
                <Switch
                  checked={settings.notifications.tradeAlerts}
                  onCheckedChange={(checked) => handleNotificationChange('tradeAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control how your data is used and shared</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">Allow anonymous data sharing for research</p>
                </div>
                <Switch
                  checked={settings.privacy.dataSharing}
                  onCheckedChange={(checked) => handlePrivacyChange('dataSharing', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Analytics</Label>
                  <p className="text-sm text-muted-foreground">Help us improve by sharing usage data</p>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => handlePrivacyChange('analytics', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">Receive product updates and news</p>
                </div>
                <Switch
                  checked={settings.privacy.marketing}
                  onCheckedChange={(checked) => handlePrivacyChange('marketing', checked)}
                />
              </div>
              
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-destructive">Data Export</p>
                    <p className="text-sm text-destructive/80">
                      Download all your trading data in a machine-readable format
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Database className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={settings.appearance.theme}
                  onChange={(e) => handleAppearanceChange('theme', e.target.value as 'light' | 'dark' | 'system')}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Language</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={settings.appearance.language}
                  onChange={(e) => handleAppearanceChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Date Format</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={settings.appearance.dateFormat}
                  onChange={(e) => handleAppearanceChange('dateFormat', e.target.value)}
                >
                  <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                  <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                  <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your trading data and account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">Export Trading Data</p>
                    <p className="text-sm text-muted-foreground">Download all your trades and journal entries</p>
                  </div>
                  <Button variant="outline">
                    <Database className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">API Access</p>
                    <p className="text-sm text-muted-foreground">Manage your API keys and integrations</p>
                  </div>
                  <Button variant="outline">
                    <Key className="mr-2 h-4 w-4" />
                    Manage
                  </Button>
                </div>
                
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-medium text-destructive">Delete Account</p>
                        <p className="text-sm text-destructive/80">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}