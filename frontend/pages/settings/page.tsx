'use client';

import { useEffect, useState } from 'react';
import { socialsyncApi } from '@/lib/api/socialsync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Settings,
  Youtube,
  Instagram,
  FolderOpen,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type Platform = 'google' | 'instagram' | 'youtube';

interface ConnectionStatus {
  platform: Platform;
  connected: boolean;
  email?: string;
  expiresAt?: string;
  scopes?: string[];
}

export default function SocialSyncSettings() {
  const userId = 'temp-user-id'; // TODO: Replace with actual user ID
  const { toast } = useToast();

  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<Platform | null>(null);
  const [generalSettings, setGeneralSettings] = useState({
    scanIntervalHours: 24,
    postingCheckIntervalMinutes: 1,
  });

  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = async () => {
    try {
      setLoading(true);
      const data = await socialsyncApi.auth.checkStatus(userId);

      const statusList: ConnectionStatus[] = [
        {
          platform: 'google',
          connected: data.google?.connected || false,
          email: data.google?.email,
          expiresAt: data.google?.expiresAt,
        },
        {
          platform: 'instagram',
          connected: data.instagram?.connected || false,
          email: data.instagram?.username,
        },
        {
          platform: 'youtube',
          connected: data.youtube?.connected || false,
          email: data.youtube?.email,
          expiresAt: data.youtube?.expiresAt,
        },
      ];

      setConnections(statusList);
    } catch (error) {
      console.error('Failed to load connection status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load connection status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: Platform) => {
    try {
      // Redirect to OAuth flow
      const authUrl = await getAuthUrl(platform);
      window.location.href = authUrl;
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to initiate ${platform} connection`,
        variant: 'destructive',
      });
    }
  };

  const getAuthUrl = async (platform: Platform): Promise<string> => {
    // Build OAuth URL based on platform
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const redirectUri = `${window.location.origin}/socialsync/settings`;

    switch (platform) {
      case 'google':
        return `${baseUrl}/api/socialsync/auth/google?userId=${userId}&redirectUri=${encodeURIComponent(redirectUri)}`;
      case 'instagram':
        return `${baseUrl}/api/socialsync/auth/instagram?userId=${userId}&redirectUri=${encodeURIComponent(redirectUri)}`;
      case 'youtube':
        return `${baseUrl}/api/socialsync/auth/youtube?userId=${userId}&redirectUri=${encodeURIComponent(redirectUri)}`;
      default:
        throw new Error('Unknown platform');
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    try {
      setDisconnecting(platform);
      await socialsyncApi.auth.disconnect(userId, platform);

      toast({
        title: 'Success',
        description: `Disconnected from ${getPlatformName(platform)}`,
      });

      await loadConnectionStatus();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to disconnect from ${getPlatformName(platform)}`,
        variant: 'destructive',
      });
    } finally {
      setDisconnecting(null);
    }
  };

  const getPlatformName = (platform: Platform): string => {
    switch (platform) {
      case 'google':
        return 'Google Drive';
      case 'instagram':
        return 'Instagram';
      case 'youtube':
        return 'YouTube';
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'google':
        return <FolderOpen className="h-8 w-8" />;
      case 'instagram':
        return <Instagram className="h-8 w-8" />;
      case 'youtube':
        return <Youtube className="h-8 w-8" />;
    }
  };

  const getPlatformColor = (platform: Platform): string => {
    switch (platform) {
      case 'google':
        return 'text-blue-500';
      case 'instagram':
        return 'text-pink-500';
      case 'youtube':
        return 'text-red-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage connections and preferences
          </p>
        </div>
        <Link href="/socialsync">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>

      {/* Platform Connections */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Connections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="py-8 text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Loading connections...</p>
            </div>
          ) : (
            connections.map((connection) => (
              <div key={connection.platform}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={getPlatformColor(connection.platform)}>
                      {getPlatformIcon(connection.platform)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {getPlatformName(connection.platform)}
                      </div>
                      {connection.connected ? (
                        <div className="text-sm text-muted-foreground">
                          {connection.email && (
                            <div>Connected as: {connection.email}</div>
                          )}
                          {connection.expiresAt && (
                            <div>
                              Expires: {new Date(connection.expiresAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Not connected
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connection.connected ? (
                      <>
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Connected
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(connection.platform)}
                          disabled={disconnecting === connection.platform}
                        >
                          {disconnecting === connection.platform ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Disconnecting...
                            </>
                          ) : (
                            <>
                              <Unlink className="mr-2 h-4 w-4" />
                              Disconnect
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Disconnected
                        </Badge>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleConnect(connection.platform)}
                        >
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Connect
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {connection.platform !== 'youtube' && <Separator className="mt-6" />}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="scanInterval">
              Content Scan Interval (hours)
            </Label>
            <Input
              id="scanInterval"
              type="number"
              min="1"
              max="168"
              value={generalSettings.scanIntervalHours}
              onChange={(e) =>
                setGeneralSettings({
                  ...generalSettings,
                  scanIntervalHours: parseInt(e.target.value),
                })
              }
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              How often to automatically scan Google Drive for new content
            </p>
          </div>

          <div>
            <Label htmlFor="postingInterval">
              Posting Check Interval (minutes)
            </Label>
            <Input
              id="postingInterval"
              type="number"
              min="1"
              max="60"
              value={generalSettings.postingCheckIntervalMinutes}
              onChange={(e) =>
                setGeneralSettings({
                  ...generalSettings,
                  postingCheckIntervalMinutes: parseInt(e.target.value),
                })
              }
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              How often to check for due posts in the queue
            </p>
          </div>

          <div className="pt-4">
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-mono">{userId}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Plan</span>
            <Badge>Free</Badge>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">API Version</span>
            <span>v1.0.0</span>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Clear All Queue Items</div>
              <div className="text-sm text-muted-foreground">
                Remove all items from the posting queue
              </div>
            </div>
            <Button variant="destructive" size="sm">
              Clear Queue
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Reset All Connections</div>
              <div className="text-sm text-muted-foreground">
                Disconnect from all platforms and reset settings
              </div>
            </div>
            <Button variant="destructive" size="sm">
              Reset All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
