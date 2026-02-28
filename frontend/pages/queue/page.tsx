'use client';

import { useEffect, useState } from 'react';
import { socialsyncApi } from '@/lib/api/socialsync';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function QueueManagement() {
  const userId = 'temp-user-id'; // TODO: Replace with actual user ID
  const { toast } = useToast();

  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await socialsyncApi.queue.getAll(userId);
      setQueue(data.items || []);
    } catch (error) {
      console.error('Failed to load queue:', error);
      toast({
        title: 'Error',
        description: 'Failed to load queue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await socialsyncApi.queue.delete(id);
      toast({
        title: 'Success',
        description: 'Queue item deleted',
      });
      await loadQueue();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete queue item',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      processing: 'default',
      posted: 'success',
      failed: 'destructive',
      scheduled: 'outline',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getPlatformBadge = (platform: string) => {
    return (
      <Badge variant={platform === 'youtube' ? 'destructive' : 'secondary'}>
        {platform}
      </Badge>
    );
  };

  const filterQueue = (status?: string) => {
    if (!status || status === 'all') return queue;
    return queue.filter((item) => item.status === status);
  };

  const filteredQueue = filterQueue(activeTab);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <p className="text-muted-foreground">{queue.length} items in queue</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadQueue} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Link href="/socialsync">
            <Button variant="outline">← Back</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({queue.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({filterQueue('pending').length})
          </TabsTrigger>
          <TabsTrigger value="processing">
            Processing ({filterQueue('processing').length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Scheduled ({filterQueue('scheduled').length})
          </TabsTrigger>
          <TabsTrigger value="posted">
            Posted ({filterQueue('posted').length})
          </TabsTrigger>
          <TabsTrigger value="failed">
            Failed ({filterQueue('failed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="mx-auto h-8 w-8 animate-spin" />
                  <p className="mt-4 text-muted-foreground">Loading queue...</p>
                </div>
              ) : filteredQueue.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No items in this status
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content ID</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled For</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Posted At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQueue.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-mono text-xs">
                          {item.contentId.slice(-8)}
                        </TableCell>
                        <TableCell>{getPlatformBadge(item.platform)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          {item.scheduledFor
                            ? new Date(item.scheduledFor).toLocaleString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{item.attempts}</TableCell>
                        <TableCell>
                          {item.postedAt
                            ? new Date(item.postedAt).toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {item.platformPostId &&
                              item.platform === 'youtube' && (
                                <a
                                  href={`https://www.youtube.com/watch?v=${item.platformPostId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="ghost" size="sm">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </a>
                              )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item._id)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
