'use client';

import { useEffect, useState } from 'react';
import { socialsyncApi } from '@/lib/api/socialsync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Youtube, RefreshCw, Edit2, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function YouTubeChannels() {
  const userId = 'temp-user-id'; // TODO: Replace with actual user ID
  const { toast } = useToast();

  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [editingChannel, setEditingChannel] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    enabled: true,
    dailyQuota: 5,
    postingIntervalMinutes: 120,
    driveFolderId: '',
  });

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const data = await socialsyncApi.channels.getAll(userId);
      setChannels(data.channels || []);
    } catch (error) {
      console.error('Failed to load channels:', error);
      toast({
        title: 'Error',
        description: 'Failed to load YouTube channels',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchChannels = async () => {
    try {
      setFetching(true);
      const result = await socialsyncApi.channels.fetchFromYouTube(userId);

      toast({
        title: 'Success',
        description: `Synced ${result.channelCount} YouTube channels`,
      });

      await loadChannels();
    } catch (error: any) {
      console.error('Failed to fetch channels:', error);
      toast({
        title: 'Failed to Fetch Channels',
        description: error.message || 'Make sure you have connected your YouTube account',
        variant: 'destructive',
      });
    } finally {
      setFetching(false);
    }
  };

  const handleOpenEdit = (channel: any) => {
    setEditingChannel(channel);
    setEditForm({
      enabled: channel.enabled,
      dailyQuota: channel.dailyQuota,
      postingIntervalMinutes: channel.postingIntervalMinutes,
      driveFolderId: channel.driveFolderId || '',
    });
  };

  const handleSaveEdit = async () => {
    try {
      await socialsyncApi.channels.update(editingChannel._id, editForm);

      toast({
        title: 'Success',
        description: 'Channel settings updated',
      });

      setEditingChannel(null);
      await loadChannels();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update channel',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove channel "${title}"?`)) {
      return;
    }

    try {
      await socialsyncApi.channels.delete(id);

      toast({
        title: 'Success',
        description: 'Channel removed',
      });

      await loadChannels();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete channel',
        variant: 'destructive',
      });
    }
  };

  const handleToggleEnabled = async (channel: any) => {
    try {
      await socialsyncApi.channels.update(channel._id, {
        enabled: !channel.enabled,
      });

      toast({
        title: 'Success',
        description: `Channel ${!channel.enabled ? 'enabled' : 'disabled'}`,
      });

      await loadChannels();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update channel',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">YouTube Channels</h1>
          <p className="text-muted-foreground">
            {channels.length} channels connected
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleFetchChannels} disabled={fetching}>
            {fetching ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Youtube className="mr-2 h-4 w-4" />
                Fetch from YouTube
              </>
            )}
          </Button>
          <Link href="/socialsync">
            <Button variant="outline">← Back</Button>
          </Link>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Click "Fetch from YouTube" to sync your YouTube channels</li>
            <li>Configure posting settings for each channel (quota, interval, Drive folder)</li>
            <li>Enable/disable channels individually</li>
            <li>SocialSync will automatically post content based on your schedules</li>
          </ol>
        </CardContent>
      </Card>

      {/* Channels Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Loading channels...</p>
            </div>
          ) : channels.length === 0 ? (
            <div className="p-12 text-center">
              <Youtube className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No YouTube channels connected.
              </p>
              <p className="text-sm text-muted-foreground">
                Click "Fetch from YouTube" to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Daily Quota</TableHead>
                  <TableHead>Posting Interval</TableHead>
                  <TableHead>Videos Today</TableHead>
                  <TableHead>Last Posted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((channel) => (
                  <TableRow key={channel._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {channel.thumbnailUrl && (
                          <img
                            src={channel.thumbnailUrl}
                            alt={channel.title}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium">{channel.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {channel.subscriberCount?.toLocaleString()} subscribers
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={channel.enabled ? 'success' : 'secondary'}>
                          {channel.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Switch
                          checked={channel.enabled}
                          onCheckedChange={() => handleToggleEnabled(channel)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{channel.dailyQuota} videos/day</TableCell>
                    <TableCell>{channel.postingIntervalMinutes} minutes</TableCell>
                    <TableCell>
                      <span className={channel.videosPostedToday >= channel.dailyQuota ? 'text-orange-500' : ''}>
                        {channel.videosPostedToday} / {channel.dailyQuota}
                      </span>
                    </TableCell>
                    <TableCell>
                      {channel.lastPostedAt
                        ? new Date(channel.lastPostedAt).toLocaleString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <a
                          href={`https://www.youtube.com/channel/${channel.youtubeChannelId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(channel)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(channel._id, channel.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingChannel} onOpenChange={() => setEditingChannel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Channel Settings</DialogTitle>
            <DialogDescription>
              Configure posting settings for {editingChannel?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Channel Enabled</Label>
              <Switch
                id="enabled"
                checked={editForm.enabled}
                onCheckedChange={(enabled) =>
                  setEditForm({ ...editForm, enabled })
                }
              />
            </div>

            <div>
              <Label htmlFor="dailyQuota">Daily Quota (videos per day)</Label>
              <Input
                id="dailyQuota"
                type="number"
                min="1"
                max="50"
                value={editForm.dailyQuota}
                onChange={(e) =>
                  setEditForm({ ...editForm, dailyQuota: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum videos to post per day (1-50)
              </p>
            </div>

            <div>
              <Label htmlFor="postingInterval">Posting Interval (minutes)</Label>
              <Input
                id="postingInterval"
                type="number"
                min="60"
                max="1440"
                value={editForm.postingIntervalMinutes}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    postingIntervalMinutes: parseInt(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum time between posts (60-1440 minutes)
              </p>
            </div>

            <div>
              <Label htmlFor="driveFolderId">Google Drive Folder ID</Label>
              <Input
                id="driveFolderId"
                placeholder="Enter Drive folder ID"
                value={editForm.driveFolderId}
                onChange={(e) =>
                  setEditForm({ ...editForm, driveFolderId: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Folder to scan for content for this channel
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingChannel(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
