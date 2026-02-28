'use client';

import { useEffect, useState } from 'react';
import { socialsyncApi } from '@/lib/api/socialsync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_TIMES = ['09:00', '12:00', '15:00', '18:00', '21:00'];

export default function ScheduleManager() {
  const userId = 'temp-user-id';
  const { toast } = useToast();

  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    platform: 'instagram',
    days: [1, 2, 3, 4, 5], // Mon-Fri
    times: ['09:00', '15:00', '21:00'],
    enabled: true,
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await socialsyncApi.schedule.getAll(userId);
      setSchedules(data.schedules || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load schedules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await socialsyncApi.schedule.upsert({
        userId,
        ...newSchedule,
      });

      toast({
        title: 'Success',
        description: 'Schedule created successfully',
      });

      setCreating(false);
      await loadSchedules();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create schedule',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await socialsyncApi.schedule.delete(id);
      toast({
        title: 'Success',
        description: 'Schedule deleted',
      });
      await loadSchedules();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule Manager</h1>
          <p className="text-muted-foreground">
            Configure posting schedules for each platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Schedule
          </Button>
          <Link href="/socialsync">
            <Button variant="outline">← Back</Button>
          </Link>
        </div>
      </div>

      {creating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Platform</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={newSchedule.platform === 'instagram' ? 'default' : 'outline'}
                  onClick={() => setNewSchedule({ ...newSchedule, platform: 'instagram' })}
                >
                  Instagram
                </Button>
                <Button
                  variant={newSchedule.platform === 'youtube' ? 'default' : 'outline'}
                  onClick={() => setNewSchedule({ ...newSchedule, platform: 'youtube' })}
                >
                  YouTube
                </Button>
              </div>
            </div>

            <div>
              <Label>Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DAYS.map((day, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${index}`}
                      checked={newSchedule.days.includes(index)}
                      onCheckedChange={(checked) => {
                        const days = checked
                          ? [...newSchedule.days, index]
                          : newSchedule.days.filter((d) => d !== index);
                        setNewSchedule({ ...newSchedule, days });
                      }}
                    />
                    <label htmlFor={`day-${index}`} className="text-sm">
                      {day.slice(0, 3)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create Schedule</Button>
              <Button variant="outline" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Loading schedules...</p>
            </CardContent>
          </Card>
        ) : schedules.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No schedules configured. Create one to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>
                      {schedule.platform === 'youtube' ? 'YouTube' : 'Instagram'}{' '}
                      Schedule
                    </CardTitle>
                    <Badge variant={schedule.enabled ? 'success' : 'secondary'}>
                      {schedule.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(schedule._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Days:</span>{' '}
                    {schedule.days.map((d: number) => DAYS[d]).join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Times:</span>{' '}
                    {schedule.times.join(', ')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
