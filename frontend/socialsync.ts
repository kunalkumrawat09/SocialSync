import ky from 'ky';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const socialsyncApi = {
  // Content APIs
  content: {
    getAll: (userId: string, status?: string, limit?: number) =>
      ky
        .get(`${API_BASE}/api/socialsync/content`, {
          searchParams: { userId, ...(status && { status }), ...(limit && { limit }) },
        })
        .json(),

    scan: (userId: string, folderId: string) =>
      ky
        .post(`${API_BASE}/api/socialsync/content/scan`, {
          json: { userId, folderId },
        })
        .json(),

    getOne: (id: string) =>
      ky.get(`${API_BASE}/api/socialsync/content/${id}`).json(),
  },

  // Queue APIs
  queue: {
    getAll: (userId: string, platform?: string, status?: string, limit?: number) =>
      ky
        .get(`${API_BASE}/api/socialsync/queue`, {
          searchParams: {
            userId,
            ...(platform && { platform }),
            ...(status && { status }),
            ...(limit && { limit }),
          },
        })
        .json(),

    add: (data: {
      userId: string;
      contentId: string;
      platform: string;
      scheduledFor: string;
      channelId?: string;
    }) =>
      ky
        .post(`${API_BASE}/api/socialsync/queue`, {
          json: data,
        })
        .json(),

    updateStatus: (id: string, status: string, error?: string) =>
      ky
        .patch(`${API_BASE}/api/socialsync/queue/${id}/status`, {
          json: { status, error },
        })
        .json(),

    delete: (id: string) =>
      ky.delete(`${API_BASE}/api/socialsync/queue/${id}`).json(),

    getStats: (userId: string) =>
      ky
        .get(`${API_BASE}/api/socialsync/queue/stats`, {
          searchParams: { userId },
        })
        .json(),
  },

  // Schedule APIs
  schedule: {
    getAll: (userId: string, platform?: string) =>
      ky
        .get(`${API_BASE}/api/socialsync/schedule`, {
          searchParams: { userId, ...(platform && { platform }) },
        })
        .json(),

    upsert: (data: {
      userId: string;
      platform: string;
      days: number[];
      times: string[];
      enabled: boolean;
      channelId?: string;
    }) =>
      ky
        .post(`${API_BASE}/api/socialsync/schedule`, {
          json: data,
        })
        .json(),

    delete: (id: string) =>
      ky.delete(`${API_BASE}/api/socialsync/schedule/${id}`).json(),
  },

  // Channels APIs
  channels: {
    getAll: (userId: string) =>
      ky
        .get(`${API_BASE}/api/socialsync/channels`, {
          searchParams: { userId },
        })
        .json(),

    fetchFromYouTube: (userId: string) =>
      ky
        .post(`${API_BASE}/api/socialsync/channels/fetch`, {
          json: { userId },
        })
        .json(),

    update: (id: string, data: any) =>
      ky
        .patch(`${API_BASE}/api/socialsync/channels/${id}`, {
          json: data,
        })
        .json(),

    delete: (id: string) =>
      ky.delete(`${API_BASE}/api/socialsync/channels/${id}`).json(),
  },

  // Auth APIs
  auth: {
    saveToken: (data: {
      userId: string;
      platform: string;
      accessToken: string;
      refreshToken?: string;
      expiresAt?: string;
      accountId?: string;
      scope?: string;
    }) =>
      ky
        .post(`${API_BASE}/api/socialsync/auth/token`, {
          json: data,
        })
        .json(),

    checkStatus: (userId: string, platform: string) =>
      ky
        .get(`${API_BASE}/api/socialsync/auth/status`, {
          searchParams: { userId, platform },
        })
        .json(),

    disconnect: (userId: string, platform: string) =>
      ky
        .post(`${API_BASE}/api/socialsync/auth/disconnect`, {
          json: { userId, platform },
        })
        .json(),
  },

  // Stats APIs
  stats: {
    getDashboard: (userId: string) =>
      ky
        .get(`${API_BASE}/api/socialsync/stats/dashboard`, {
          searchParams: { userId },
        })
        .json(),

    getActivity: (userId: string, limit?: number) =>
      ky
        .get(`${API_BASE}/api/socialsync/stats/activity`, {
          searchParams: { userId, ...(limit && { limit }) },
        })
        .json(),
  },
};
