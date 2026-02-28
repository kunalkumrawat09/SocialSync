'use client';

import { useEffect, useState } from 'react';
import { socialsyncApi } from '@/lib/api/socialsync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import {
  FolderOpen,
  ListChecks,
  CheckCircle2,
  XCircle,
  Youtube,
  Instagram,
  Calendar,
  Activity,
  Settings,
} from 'lucide-react';

export default function SocialSyncDashboard() {
  // TODO: Get userId from auth context
  const userId = 'temp-user-id'; // Replace with actual user ID

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await socialsyncApi.stats.getDashboard(userId);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading SocialSync...</p>
        </div>
      </div>
    );
  }

  const queueStats = stats?.queue || {
    pending: 0,
    processing: 0,
    posted: 0,
    failed: 0,
    scheduled: 0,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SocialSync</h1>
          <p className="text-muted-foreground">
            Automated social media content management
          </p>
        </div>
        <Link href="/socialsync/settings">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Library</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.contentCount || 0}</div>
            <p className="text-xs text-muted-foreground">Total videos</p>
            <Link href="/socialsync/content">
              <Button variant="link" className="p-0 h-auto">
                View all →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueStats.pending}</div>
            <p className="text-xs text-muted-foreground">Ready to post</p>
            <Link href="/socialsync/queue?status=pending">
              <Button variant="link" className="p-0 h-auto">
                View queue →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueStats.posted}</div>
            <p className="text-xs text-muted-foreground">Successfully posted</p>
            <Link href="/socialsync/queue?status=posted">
              <Button variant="link" className="p-0 h-auto">
                View posted →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueStats.failed}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
            <Link href="/socialsync/queue?status=failed">
              <Button variant="link" className="p-0 h-auto">
                View failed →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/socialsync/content">
            <Button variant="outline" className="w-full justify-start">
              <FolderOpen className="mr-2 h-4 w-4" />
              Browse Content
            </Button>
          </Link>

          <Link href="/socialsync/schedule">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Manage Schedule
            </Button>
          </Link>

          <Link href="/socialsync/queue">
            <Button variant="outline" className="w-full justify-start">
              <ListChecks className="mr-2 h-4 w-4" />
              View Queue
            </Button>
          </Link>

          <Link href="/socialsync/channels">
            <Button variant="outline" className="w-full justify-start">
              <Youtube className="mr-2 h-4 w-4" />
              YouTube Channels
            </Button>
          </Link>

          <Link href="/socialsync/settings">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>

          <Button variant="outline" className="w-full justify-start">
            <Activity className="mr-2 h-4 w-4" />
            Activity Feed
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity: any) => (
                <div
                  key={activity._id}
                  className="flex items-start space-x-4 text-sm"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      activity.type === 'post_success'
                        ? 'bg-green-100 text-green-600'
                        : activity.type === 'post_failed'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {activity.type === 'post_success' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : activity.type === 'post_failed' ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No recent activity
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
