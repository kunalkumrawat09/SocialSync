'use client';

import { useEffect, useState } from 'react';
import { socialsyncApi } from '@/lib/api/socialsync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FolderOpen, Search, RefreshCw, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ContentLibrary() {
  const userId = 'temp-user-id'; // TODO: Replace with actual user ID
  const { toast } = useToast();

  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [folderId, setFolderId] = useState('');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const data = await socialsyncApi.content.getAll(userId, undefined, 1000);
      setContent(data.items || []);
    } catch (error) {
      console.error('Failed to load content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load content library',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!folderId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a Google Drive folder ID',
        variant: 'destructive',
      });
      return;
    }

    try {
      setScanning(true);
      const result = await socialsyncApi.content.scan(userId, folderId);

      toast({
        title: 'Scan Complete',
        description: `Discovered ${result.discovered} new videos, skipped ${result.skipped}`,
      });

      await loadContent();
      setFolderId('');
    } catch (error) {
      console.error('Scan failed:', error);
      toast({
        title: 'Scan Failed',
        description: 'Failed to scan Google Drive folder',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };

  const filteredContent = content.filter((item) =>
    item.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      queued: 'default',
      posted: 'success',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">
            {content.length} videos in library
          </p>
        </div>
        <Link href="/socialsync">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>

      {/* Scan Drive Folder */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Google Drive Folder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter Google Drive folder ID"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleScan} disabled={scanning}>
              {scanning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Scan Folder
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={loadContent} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Content Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Loading content...</p>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No content found. Scan a Google Drive folder to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Discovered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContent.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.filename}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {(item.sizeBytes / 1024 / 1024).toFixed(1)} MB
                    </TableCell>
                    <TableCell>
                      {item.durationSeconds
                        ? `${item.durationSeconds}s`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Date(item.discoveredAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://drive.google.com/file/d/${item.driveFileId}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
