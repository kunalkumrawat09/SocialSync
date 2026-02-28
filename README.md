# SocialSync - Automated Social Media Content Manager

**Automated content posting to Instagram Reels & YouTube from Google Drive**

---

## 📁 Project Structure

```
socialsync/
├── backend/              # NestJS Backend Module
│   └── socialsync/
│       ├── controllers/  # REST API endpoints (6 controllers)
│       ├── services/     # Business logic (8 services)
│       ├── entities/     # MongoDB schemas (6 entities)
│       ├── workers/      # Background jobs (2 workers)
│       └── interfaces/   # TypeScript interfaces
│
├── frontend/             # Next.js Frontend
│   ├── pages/           # UI pages (5 pages)
│   │   ├── page.tsx            # Dashboard
│   │   ├── content/            # Content Library
│   │   ├── queue/              # Queue Management
│   │   ├── schedule/           # Schedule Manager
│   │   ├── channels/           # YouTube Channels
│   │   └── settings/           # Settings & OAuth
│   └── socialsync.ts    # API Client
│
└── docs/                # Documentation
    ├── SOCIALSYNC_TESTING_GUIDE.md
    ├── SOCIALSYNC_MIGRATION_COMPLETE.md
    └── ARCHITECTURE_CLARIFICATION.md
```

---

## 🚀 Features

### Content Management
- **Google Drive Integration** - Automatic video discovery
- **Multi-Platform Support** - Instagram Reels & YouTube
- **Queue System** - Track pending, processing, posted content
- **Scheduling** - Set posting times and days

### Platform Features
- **Instagram Reels** - Resumable uploads with chunking
- **YouTube** - Native scheduling, multiple channels
- **OAuth Security** - AES-256-GCM encrypted tokens
- **Multi-Tenant** - Full user isolation

### Automation
- **Background Workers** - Hourly content scanning
- **Auto Posting** - Minute-based queue processing
- **Retry Logic** - Automatic retry on failures
- **Activity Logging** - Complete audit trail

---

## 🛠 Tech Stack

**Backend:**
- NestJS (Node.js framework)
- MongoDB + MikroORM
- OAuth 2.0 (Google, Instagram, YouTube)
- AES-256-GCM encryption
- Cron-based workers

**Frontend:**
- Next.js 14 (React 18)
- TailwindCSS
- Radix UI components
- ky HTTP client
- TypeScript

---

## 📋 Requirements

- Node.js 18+
- MongoDB
- Google OAuth credentials
- Instagram App credentials
- YouTube API key

---

## ⚙️ Environment Variables

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/socialsync

# OAuth - Google Drive & YouTube
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/socialsync/auth/google/callback

# OAuth - Instagram
INSTAGRAM_APP_ID=your-app-id
INSTAGRAM_APP_SECRET=your-app-secret
INSTAGRAM_REDIRECT_URI=http://localhost:3001/api/socialsync/auth/instagram/callback

# YouTube
YOUTUBE_API_KEY=your-api-key

# Security
OAUTH_ENCRYPTION_KEY=64-character-hex-string

# URLs
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

---

## 🔧 Integration

This module is designed to integrate into existing NestJS + Next.js applications:

### Backend Integration
1. Copy `backend/socialsync/` to your NestJS `src/` directory
2. Add `SocialsyncModule` to your `app.module.ts` imports
3. Configure environment variables
4. Run migrations if needed

### Frontend Integration
1. Copy `frontend/pages/` to your Next.js `app/` directory
2. Copy `frontend/socialsync.ts` to your API client directory
3. Configure API base URL
4. Add navigation links

---

## 📊 API Endpoints

### Content
- `GET /api/socialsync/content` - List content
- `POST /api/socialsync/content/scan` - Scan Drive folder

### Queue
- `GET /api/socialsync/queue` - List queue items
- `POST /api/socialsync/queue` - Add to queue
- `PATCH /api/socialsync/queue/:id/status` - Update status
- `DELETE /api/socialsync/queue/:id` - Remove item

### Schedule
- `GET /api/socialsync/schedule` - List schedules
- `POST /api/socialsync/schedule` - Create/update schedule
- `DELETE /api/socialsync/schedule/:id` - Delete schedule

### Channels
- `GET /api/socialsync/channels` - List YouTube channels
- `POST /api/socialsync/channels/fetch` - Sync from YouTube
- `PATCH /api/socialsync/channels/:id` - Update settings
- `DELETE /api/socialsync/channels/:id` - Remove channel

### Auth
- `POST /api/socialsync/auth/token` - Save OAuth token
- `GET /api/socialsync/auth/status` - Check status
- `DELETE /api/socialsync/auth/:platform` - Disconnect

### Stats
- `GET /api/socialsync/stats/dashboard` - Dashboard stats

---

## 🧪 Testing

See `docs/SOCIALSYNC_TESTING_GUIDE.md` for comprehensive testing instructions covering:
- API endpoint testing
- OAuth flow testing
- Frontend testing
- End-to-end testing
- Performance testing

---

## 📚 Documentation

- **Testing Guide:** `docs/SOCIALSYNC_TESTING_GUIDE.md`
- **Migration Guide:** `docs/SOCIALSYNC_MIGRATION_COMPLETE.md`
- **Architecture:** `docs/ARCHITECTURE_CLARIFICATION.md`

---

## 🔒 Security

- OAuth tokens encrypted with AES-256-GCM
- Multi-tenant data isolation
- Secure token refresh
- API rate limiting ready
- CORS configured

---

## 🎯 Use Cases

1. **Content Creators** - Auto-post Drive videos to Instagram/YouTube
2. **OTT Platforms** - Sync content to social media
3. **Marketing Teams** - Schedule social media campaigns
4. **Media Companies** - Distribute content across platforms

---

## 📦 Deployment

### Backend
```bash
# Install dependencies
npm install

# Build
npm run build

# Start
npm run start:prod
```

### Frontend
```bash
# Install dependencies
npm install

# Build
npm run build

# Start
npm run start
```

---

## 🤝 Support

- GitHub: https://github.com/kunalkumrawat09
- Email: kunal@stage.in

---

## 📄 License

Private Project - All Rights Reserved

---

**Built by Kunal Kumrawat**
