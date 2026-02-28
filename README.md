# 🚀 SocialSync - Automated Social Media Content Manager

> Automate your social media content posting from Google Drive to Instagram Reels & YouTube

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

SocialSync is a powerful automation tool that seamlessly integrates with Google Drive to discover video content and automatically posts it to multiple social media platforms. Perfect for content creators, marketing teams, and media companies who want to streamline their social media workflow.

### Why SocialSync?

- ⏰ **Save Time** - Automate repetitive posting tasks
- 📈 **Scale Content** - Post to multiple platforms simultaneously
- 🔄 **Stay Consistent** - Schedule posts for optimal engagement
- 🎯 **Multi-Platform** - Instagram Reels & YouTube (more coming soon)
- 🔒 **Secure** - AES-256-GCM encrypted OAuth tokens

## ✨ Features

### 🎬 Content Management
- **Google Drive Integration** - Automatic video discovery from Drive folders
- **Smart Scanning** - Periodic folder scans for new content
- **Status Tracking** - Monitor content status (pending, queued, posted, failed)
- **Search & Filter** - Quickly find content by filename or status

### 📱 Multi-Platform Publishing
- **Instagram Reels** - Automated Reels posting with resumable uploads
- **YouTube** - Native scheduling with YouTube Data API v3
- **Chunked Uploads** - Handle large files with 5MB chunk uploads
- **Retry Logic** - Automatic retry on failed posts

### ⏰ Intelligent Scheduling
- **Custom Schedules** - Set posting days and times
- **Platform-Specific** - Different schedules for each platform
- **Queue Management** - View and manage upcoming posts
- **Background Workers** - Cron-based automated processing

### 📊 Dashboard & Analytics
- **Real-time Stats** - Content count, pending posts, posted count
- **Activity Feed** - Complete audit log of all actions
- **Status Badges** - Visual indicators for post status
- **Platform Filters** - Filter queue by platform or status

### 🔐 Security & Multi-Tenancy
- **OAuth 2.0** - Secure authentication with Google, Instagram, YouTube
- **Token Encryption** - AES-256-GCM encrypted credentials
- **Multi-User** - Complete data isolation per user
- **CORS Ready** - Secure API with CORS configuration

## 🛠 Tech Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Database:** MongoDB with MikroORM
- **Authentication:** OAuth 2.0 (Google, Instagram, YouTube)
- **Encryption:** AES-256-GCM
- **Scheduling:** @nestjs/schedule (Cron jobs)
- **Queue:** Bull (Redis-based)

### Frontend
- **Framework:** Next.js 14 (React 18)
- **UI Library:** Radix UI + TailwindCSS
- **HTTP Client:** ky
- **Validation:** Zod
- **State Management:** React Hooks

### APIs & Services
- **Google Drive API** - File listing and downloads
- **Instagram Graph API** - Reels posting
- **YouTube Data API v3** - Video uploads and scheduling

## 📁 Project Structure

```
socialsync/
├── backend/
│   └── socialsync/
│       ├── controllers/           # REST API endpoints (6)
│       │   ├── auth.controller.ts
│       │   ├── channels.controller.ts
│       │   ├── content.controller.ts
│       │   ├── queue.controller.ts
│       │   ├── schedule.controller.ts
│       │   └── stats.controller.ts
│       │
│       ├── services/              # Business logic (8)
│       │   ├── activity.service.ts
│       │   ├── drive.service.ts
│       │   ├── instagram.service.ts
│       │   ├── oauth.service.ts
│       │   ├── posting.service.ts
│       │   ├── queue.service.ts
│       │   ├── schedule.service.ts
│       │   └── youtube.service.ts
│       │
│       ├── entities/              # MongoDB schemas (6)
│       │   ├── activity.entity.ts
│       │   ├── content-item.entity.ts
│       │   ├── oauth-token.entity.ts
│       │   ├── queue-item.entity.ts
│       │   ├── schedule.entity.ts
│       │   └── youtube-channel.entity.ts
│       │
│       ├── workers/               # Background jobs (2)
│       │   ├── content-scanner.worker.ts
│       │   └── posting.worker.ts
│       │
│       └── interfaces/
│           └── publisher.interface.ts
│
├── frontend/
│   ├── pages/                     # Next.js pages (6)
│   │   ├── page.tsx              # Dashboard
│   │   ├── channels/             # YouTube Channels
│   │   ├── content/              # Content Library
│   │   ├── queue/                # Queue Management
│   │   ├── schedule/             # Schedule Manager
│   │   └── settings/             # Settings & OAuth
│   │
│   └── socialsync.ts             # API Client
│
├── docs/                          # Documentation
│   ├── SOCIALSYNC_TESTING_GUIDE.md
│   ├── SOCIALSYNC_MIGRATION_COMPLETE.md
│   └── ARCHITECTURE_CLARIFICATION.md
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB instance
- Google OAuth credentials
- Instagram App credentials
- YouTube API key

### Environment Variables

Create a `.env` file:

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

# Security (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
OAUTH_ENCRYPTION_KEY=your-64-character-hex-string

# URLs
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

### Installation

```bash
# Clone the repository
git clone https://github.com/kunalkumrawat09/SocialSync.git
cd SocialSync

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

```bash
# Start backend
cd backend
npm run start:dev

# Start frontend (in another terminal)
cd frontend
npm run dev
```

Access the dashboard at `http://localhost:3000/socialsync`

## 📚 API Documentation

### Content Endpoints

```http
GET    /api/socialsync/content          # List all content
POST   /api/socialsync/content/scan     # Scan Drive folder
```

### Queue Endpoints

```http
GET    /api/socialsync/queue            # List queue items
POST   /api/socialsync/queue            # Add to queue
PATCH  /api/socialsync/queue/:id/status # Update status
DELETE /api/socialsync/queue/:id        # Remove item
```

### Schedule Endpoints

```http
GET    /api/socialsync/schedule         # List schedules
POST   /api/socialsync/schedule         # Create/update
DELETE /api/socialsync/schedule/:id     # Delete schedule
```

### Channel Endpoints

```http
GET    /api/socialsync/channels          # List YouTube channels
POST   /api/socialsync/channels/fetch    # Sync from YouTube
PATCH  /api/socialsync/channels/:id      # Update settings
DELETE /api/socialsync/channels/:id      # Remove channel
```

### Auth Endpoints

```http
POST   /api/socialsync/auth/token        # Save OAuth token
GET    /api/socialsync/auth/status       # Check status
DELETE /api/socialsync/auth/:platform    # Disconnect
```

### Stats Endpoints

```http
GET    /api/socialsync/stats/dashboard   # Dashboard stats
```

## 🖼️ Screenshots

### Dashboard
*Coming soon - Screenshot of main dashboard with stats cards*

### Content Library
*Coming soon - Screenshot of content library with Drive scan*

### Queue Management
*Coming soon - Screenshot of queue with status filtering*

## 🎯 Use Cases

- **Content Creators** - Auto-post Drive videos to Instagram/YouTube
- **Marketing Teams** - Schedule social media campaigns
- **Media Companies** - Distribute content across platforms
- **OTT Platforms** - Sync content to social media

## 🗺️ Roadmap

- [ ] TikTok integration
- [ ] Twitter/X video posting
- [ ] Facebook Reels support
- [ ] LinkedIn video posts
- [ ] Analytics dashboard
- [ ] A/B testing for content
- [ ] AI-powered caption generation
- [ ] Hashtag research tool
- [ ] Engagement tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

**Kunal Kumrawat**
- GitHub: [@kunalkumrawat09](https://github.com/kunalkumrawat09)
- Email: kunal@stage.in

---

<p align="center">Made with ❤️ for automating social media</p>
