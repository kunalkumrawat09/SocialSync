# SocialSync Testing Guide

## ✅ Testing Checklist

This document provides a comprehensive testing plan for the SocialSync integration into STAGE CMS.

---

## 1. Backend API Testing

### Content Endpoints

#### GET /api/socialsync/content
```bash
# Get all content for a user
curl -X GET "http://localhost:3001/api/socialsync/content?userId=temp-user-id"

# Filter by status
curl -X GET "http://localhost:3001/api/socialsync/content?userId=temp-user-id&status=pending"

# Expected Response:
{
  "success": true,
  "count": 5,
  "items": [...]
}
```

#### POST /api/socialsync/content/scan
```bash
# Scan a Google Drive folder
curl -X POST http://localhost:3001/api/socialsync/content/scan \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "temp-user-id",
    "folderId": "YOUR_DRIVE_FOLDER_ID"
  }'

# Expected Response:
{
  "success": true,
  "discovered": 10,
  "skipped": 2,
  "message": "Discovered 10 new videos, skipped 2"
}
```

### Queue Endpoints

#### GET /api/socialsync/queue
```bash
# Get all queue items
curl -X GET "http://localhost:3001/api/socialsync/queue?userId=temp-user-id"

# Filter by platform
curl -X GET "http://localhost:3001/api/socialsync/queue?userId=temp-user-id&platform=youtube"

# Filter by status
curl -X GET "http://localhost:3001/api/socialsync/queue?userId=temp-user-id&status=pending"
```

#### POST /api/socialsync/queue
```bash
# Add content to queue
curl -X POST http://localhost:3001/api/socialsync/queue \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "temp-user-id",
    "contentId": "CONTENT_ID_HERE",
    "platform": "youtube",
    "scheduledFor": "2026-02-27T15:00:00Z"
  }'
```

#### PATCH /api/socialsync/queue/:id/status
```bash
# Update queue item status
curl -X PATCH http://localhost:3001/api/socialsync/queue/QUEUE_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "posted",
    "platformPostId": "abc123"
  }'
```

#### DELETE /api/socialsync/queue/:id
```bash
# Delete queue item
curl -X DELETE http://localhost:3001/api/socialsync/queue/QUEUE_ID
```

### Schedule Endpoints

#### GET /api/socialsync/schedule
```bash
# Get all schedules
curl -X GET "http://localhost:3001/api/socialsync/schedule?userId=temp-user-id"
```

#### POST /api/socialsync/schedule
```bash
# Create/update schedule
curl -X POST http://localhost:3001/api/socialsync/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "temp-user-id",
    "platform": "instagram",
    "days": [1, 2, 3, 4, 5],
    "times": ["09:00", "15:00", "21:00"],
    "enabled": true
  }'
```

#### DELETE /api/socialsync/schedule/:id
```bash
# Delete schedule
curl -X DELETE http://localhost:3001/api/socialsync/schedule/SCHEDULE_ID
```

### Channel Endpoints

#### GET /api/socialsync/channels
```bash
# Get all YouTube channels
curl -X GET "http://localhost:3001/api/socialsync/channels?userId=temp-user-id"
```

#### POST /api/socialsync/channels/fetch
```bash
# Fetch channels from YouTube
curl -X POST http://localhost:3001/api/socialsync/channels/fetch \
  -H "Content-Type: application/json" \
  -d '{"userId": "temp-user-id"}'
```

#### PATCH /api/socialsync/channels/:id
```bash
# Update channel settings
curl -X PATCH http://localhost:3001/api/socialsync/channels/CHANNEL_ID \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "dailyQuota": 5,
    "postingIntervalMinutes": 120,
    "driveFolderId": "FOLDER_ID"
  }'
```

#### DELETE /api/socialsync/channels/:id
```bash
# Delete channel
curl -X DELETE http://localhost:3001/api/socialsync/channels/CHANNEL_ID
```

### Auth Endpoints

#### POST /api/socialsync/auth/token
```bash
# Save OAuth token manually
curl -X POST http://localhost:3001/api/socialsync/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "temp-user-id",
    "platform": "google",
    "accessToken": "ya29.xxx",
    "refreshToken": "1//xxx",
    "expiresAt": "2026-03-01T00:00:00Z"
  }'
```

#### GET /api/socialsync/auth/status
```bash
# Check OAuth status
curl -X GET "http://localhost:3001/api/socialsync/auth/status?userId=temp-user-id"

# Expected Response:
{
  "success": true,
  "google": { "connected": true, "email": "user@gmail.com" },
  "instagram": { "connected": false },
  "youtube": { "connected": true, "email": "user@gmail.com" }
}
```

#### DELETE /api/socialsync/auth/:platform
```bash
# Disconnect platform
curl -X DELETE "http://localhost:3001/api/socialsync/auth/google?userId=temp-user-id"
```

### Stats Endpoints

#### GET /api/socialsync/stats/dashboard
```bash
# Get dashboard stats
curl -X GET "http://localhost:3001/api/socialsync/stats/dashboard?userId=temp-user-id"

# Expected Response:
{
  "success": true,
  "stats": {
    "contentCount": 25,
    "queue": {
      "pending": 5,
      "processing": 1,
      "posted": 18,
      "failed": 1,
      "scheduled": 3
    },
    "recentActivity": [...]
  }
}
```

---

## 2. OAuth Flow Testing

### Google Drive OAuth

1. **Initiate OAuth:**
   - Navigate to Settings page
   - Click "Connect" for Google Drive
   - Verify redirect to Google OAuth consent screen

2. **Grant Permissions:**
   - Select Google account
   - Grant Drive API permissions
   - Verify redirect back to Settings page

3. **Verify Connection:**
   - Check that badge shows "Connected"
   - Verify email address is displayed
   - Verify token is encrypted in database

4. **Test Token Usage:**
   - Go to Content Library
   - Enter a Drive folder ID
   - Click "Scan Folder"
   - Verify files are discovered and listed

### Instagram OAuth

1. **Initiate OAuth:**
   - Navigate to Settings page
   - Click "Connect" for Instagram
   - Verify redirect to Instagram OAuth

2. **Grant Permissions:**
   - Log in to Instagram
   - Grant permissions for posting
   - Verify redirect back to Settings

3. **Verify Connection:**
   - Check connection status in Settings
   - Verify username is displayed

4. **Test Posting:**
   - Add video to queue with platform: "instagram"
   - Set scheduled time to immediate
   - Wait for posting worker to process
   - Verify video appears on Instagram

### YouTube OAuth

1. **Initiate OAuth:**
   - Navigate to Settings page
   - Click "Connect" for YouTube
   - Verify redirect to Google OAuth (YouTube scope)

2. **Grant Permissions:**
   - Grant YouTube Data API permissions
   - Verify redirect back to Settings

3. **Test Channel Fetch:**
   - Go to YouTube Channels page
   - Click "Fetch from YouTube"
   - Verify channels are synced and displayed

4. **Test Scheduled Posting:**
   - Add video to queue with platform: "youtube"
   - Set scheduled time 5 minutes in future
   - Verify queue status updates to "scheduled"
   - Wait for scheduled time and verify video is posted

---

## 3. Frontend Testing

### Dashboard Page (/socialsync)

- [ ] Stats cards display correct counts
- [ ] Quick action buttons navigate correctly
- [ ] Recent activity feed shows activities
- [ ] Loading states work properly
- [ ] Error handling displays toasts

### Content Library (/socialsync/content)

- [ ] Content table displays all videos
- [ ] Search by filename filters correctly
- [ ] Drive folder scan works
- [ ] Scan progress shows loading spinner
- [ ] Empty state displays when no content
- [ ] Drive links open in new tab

### Queue Management (/socialsync/queue)

- [ ] All queue items display in table
- [ ] Status tabs filter correctly
- [ ] Platform badges display correctly
- [ ] Status badges have correct colors
- [ ] YouTube post links work
- [ ] Delete queue item works
- [ ] Refresh button reloads queue
- [ ] Tab counts update correctly

### Schedule Manager (/socialsync/schedule)

- [ ] Existing schedules display correctly
- [ ] Create new schedule form works
- [ ] Day checkboxes toggle correctly
- [ ] Platform selection works
- [ ] Delete schedule works
- [ ] Schedule cards show days and times
- [ ] Enable/disable toggle works

### YouTube Channels (/socialsync/channels)

- [ ] Channels table displays all channels
- [ ] Fetch from YouTube syncs channels
- [ ] Channel thumbnails display
- [ ] Subscriber counts show
- [ ] Enable/disable toggle works
- [ ] Edit channel opens dialog
- [ ] Edit form saves changes
- [ ] Delete channel works
- [ ] Videos today/quota displays correctly
- [ ] YouTube channel links open correctly

### Settings (/socialsync/settings)

- [ ] Connection status displays for all platforms
- [ ] Connected platforms show badges
- [ ] Connect buttons redirect to OAuth
- [ ] Disconnect buttons work
- [ ] General settings form displays
- [ ] Save settings button works
- [ ] Account information displays
- [ ] Danger zone buttons work

---

## 4. Integration Testing

### End-to-End Content Flow

1. **Setup:**
   - Connect Google Drive OAuth
   - Connect YouTube OAuth
   - Fetch YouTube channels

2. **Content Discovery:**
   - Scan Drive folder
   - Verify videos appear in Content Library
   - Check that status is "pending"

3. **Schedule Creation:**
   - Create schedule for YouTube
   - Set days: Mon-Fri
   - Set times: 09:00, 15:00, 21:00
   - Enable schedule

4. **Queue Population:**
   - Wait for schedule to generate queue items
   - Verify queue items appear with correct scheduled times
   - Check that status is "scheduled"

5. **Posting Execution:**
   - Wait for scheduled time
   - Verify worker processes queue item
   - Check status updates to "processing" → "posted"
   - Verify YouTube video appears on channel
   - Check activity feed logs success

### End-to-End Instagram Flow

1. **Setup:**
   - Connect Instagram OAuth
   - Scan Drive folder with video content

2. **Manual Queue:**
   - Add content to queue with platform: "instagram"
   - Set immediate scheduled time

3. **Posting:**
   - Wait 1-2 minutes for worker
   - Verify video posts to Instagram as Reel
   - Check activity feed

### Error Handling

1. **Expired Token:**
   - Set token expiresAt to past date
   - Attempt to scan Drive folder
   - Verify error message prompts reconnection

2. **Invalid Drive Folder:**
   - Enter non-existent folder ID
   - Click scan
   - Verify error toast displays

3. **Failed Post:**
   - Add invalid content to queue
   - Wait for processing
   - Verify status updates to "failed"
   - Check error message in activity

4. **Daily Quota Exceeded:**
   - Set channel daily quota to 1
   - Post 2 videos in same day
   - Verify second post fails with quota error

---

## 5. Database Testing

### Multi-User Isolation

```javascript
// Test that users can only access their own data
const user1 = new ObjectId();
const user2 = new ObjectId();

// Create content for user1
await contentRepository.create({
  userId: user1,
  filename: 'video1.mp4',
  // ...
});

// Try to query as user2
const results = await contentRepository.find({ userId: user2 });
assert(results.length === 0); // Should not see user1's content
```

### Token Encryption

```javascript
// Test that tokens are encrypted at rest
const token = await oAuthService.saveToken({
  userId,
  platform: 'google',
  accessToken: 'plaintext-token',
  // ...
});

// Check database directly
const dbToken = await oAuthRepository.findOne({ _id: token._id });
assert(dbToken.accessToken !== 'plaintext-token'); // Should be encrypted
assert(dbToken.accessToken.includes(':')); // Should have IV:authTag:encrypted format

// Decrypt and verify
const decrypted = await oAuthService.getToken(userId, 'google');
assert(decrypted.accessToken === 'plaintext-token'); // Should decrypt correctly
```

### Queue Status Transitions

```javascript
// Test valid status transitions
const queueItem = await queueService.addToQueue({
  userId,
  contentId,
  platform: 'youtube',
});

assert(queueItem.status === 'pending');

await queueService.updateStatus(queueItem._id, 'processing');
assert(queueItem.status === 'processing');

await queueService.updateStatus(queueItem._id, 'posted', undefined, 'videoId123');
assert(queueItem.status === 'posted');
assert(queueItem.platformPostId === 'videoId123');
```

---

## 6. Background Workers Testing

### Content Scanner Worker

```bash
# Check logs for scheduled scans
tail -f logs/socialsync-scanner.log

# Verify runs every hour (cron: 0 * * * *)
# Expected log: "[ContentScannerWorker] Starting scheduled scan..."
```

### Posting Worker

```bash
# Check logs for posting checks
tail -f logs/socialsync-posting.log

# Verify runs every minute (cron: * * * * *)
# Expected log: "[PostingWorker] Checking for due posts..."
```

### Manual Worker Trigger

```bash
# Trigger workers manually via NestJS CLI
npm run console -- socialsync:scan
npm run console -- socialsync:process-queue
```

---

## 7. Performance Testing

### Load Testing

```bash
# Install Artillery
npm install -g artillery

# Create load test config
cat > artillery.yml << EOF
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: '/api/socialsync/content?userId=temp-user-id'
      - get:
          url: '/api/socialsync/queue?userId=temp-user-id'
      - get:
          url: '/api/socialsync/stats/dashboard?userId=temp-user-id'
EOF

# Run load test
artillery run artillery.yml
```

### Database Query Performance

```javascript
// Test that indexes are used
const explain = await contentRepository
  .find({ userId: new ObjectId() })
  .explain('executionStats');

console.log(explain.executionStats.executionTimeMillis); // Should be < 100ms
console.log(explain.executionStats.totalDocsExamined); // Should be small
```

---

## 8. Security Testing

### SQL Injection Prevention

✅ Using MikroORM with parameterized queries - safe from SQL injection

### XSS Prevention

```javascript
// Test that user input is sanitized
const maliciousInput = '<script>alert("XSS")</script>';
const content = await contentRepository.create({
  userId,
  filename: maliciousInput,
  // ...
});

// Verify stored safely
assert(!content.filename.includes('<script>'));
```

### CSRF Protection

- [ ] Verify CSRF tokens on POST/PATCH/DELETE requests
- [ ] Test that requests without tokens are rejected

### OAuth Token Security

- [x] Tokens encrypted at rest (AES-256-GCM)
- [ ] Tokens sent over HTTPS only
- [ ] Refresh token rotation implemented
- [ ] Token expiration enforced

---

## 9. Environment Variables

Create `.env.test` file:

```bash
# MongoDB
MONGO_URI=mongodb://localhost:27017/stage-test

# OAuth - Google
GOOGLE_CLIENT_ID=your-test-client-id
GOOGLE_CLIENT_SECRET=your-test-client-secret

# OAuth - Instagram
INSTAGRAM_APP_ID=your-test-app-id
INSTAGRAM_APP_SECRET=your-test-app-secret

# OAuth - YouTube (uses Google credentials)
YOUTUBE_API_KEY=your-test-api-key

# Encryption
OAUTH_ENCRYPTION_KEY=64-character-hex-string-for-aes-256

# API
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

---

## 10. Automated Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:cov

# Test specific module
npm run test -- socialsync
```

### E2E Tests

```bash
# Run end-to-end tests
npm run test:e2e

# Test specific flow
npm run test:e2e -- --grep "content discovery"
```

### Test Coverage Goals

- Controllers: > 80%
- Services: > 90%
- Entities: 100%
- Overall: > 85%

---

## ✅ Testing Sign-off Checklist

- [ ] All 16 API endpoints tested and working
- [ ] OAuth flows tested for all 3 platforms
- [ ] All 5 frontend pages tested and functional
- [ ] End-to-end content flow verified
- [ ] Multi-user data isolation confirmed
- [ ] Token encryption validated
- [ ] Background workers running correctly
- [ ] Error handling tested
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation complete

---

## Next Steps After Testing

1. Deploy to staging environment
2. Conduct user acceptance testing (UAT)
3. Fix any bugs discovered
4. Deploy to production
5. Monitor logs and metrics
6. Gather user feedback

---

**Testing Owner:** Kunal Kumrawat
**Last Updated:** 2026-02-26
**Version:** 1.0.0
