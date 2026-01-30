# WealthMax Deployment Guide - Render

This guide provides step-by-step instructions for deploying WealthMax to Render.

## Prerequisites

- GitHub repository with your WealthMax code
- Render account (free tier works fine)
- PostgreSQL database on Render (or external)
- Gmail account for SMTP (or other email provider)

## Current Deployment URLs

- **Backend API**: https://wealthmax-backend-izhk.onrender.com
- **Frontend**: https://wealthmax-frontend.onrender.com
- **Health Check**: https://wealthmax-backend-izhk.onrender.com/api/v1/health

## Quick Start (Using Render Blueprint)

The easiest way to deploy is using the `render.yaml` blueprint:

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the `render.yaml` file

2. **Configure Environment Variables**
   
   The blueprint will prompt you for required environment variables. Use the values below.

3. **Deploy**
   
   Render will automatically deploy both backend and frontend services.

## Manual Deployment Steps

If you prefer to deploy manually or the blueprint doesn't work:

### 1. Deploy PostgreSQL Database (if not done already)

1. Go to Render Dashboard → "New" → "PostgreSQL"
2. Name: `wealthmax-db`
3. Plan: Free
4. Click "Create Database"
5. **Save the DATABASE_URL** from the database details page

### 2. Deploy Backend API

1. Go to Render Dashboard → "New" → "Web Service"
2. Connect your repository
3. Configure:
   - **Name**: `wealthmax-backend`
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

4. **Environment Variables** (click "Advanced" → "Add Environment Variable"):

   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your-database-url-from-step-1>
   JWT_SECRET=<generate-random-32-char-string>
   ENCRYPTION_KEY=<generate-random-32-char-string>
   CORS_ORIGIN=https://wealthmax-frontend.onrender.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=<your-gmail-address>
   SMTP_PASS=<your-gmail-app-password>
   EMAIL_FROM=WealthMax <noreply@wealthmax.com>
   LOG_LEVEL=info
   MFAPI_BASE_URL=https://api.mfapi.in
   PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   TS_NODE_TRANSPILE_ONLY=true
   ```

   > **Important**: For `SMTP_PASS`, use a [Gmail App Password](https://support.google.com/accounts/answer/185833), not your regular Gmail password.

5. Click "Create Web Service"

### 3. Run Database Migrations

After backend is deployed:

1. Go to your backend service in Render
2. Click "Shell" tab
3. Run migrations:
   ```bash
   cd backend
   npm run migrate:up
   ```

### 4. Deploy Frontend

1. Go to Render Dashboard → "New" → "Static Site"
2. Connect your repository
3. Configure:
   - **Name**: `wealthmax-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

4. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://wealthmax-backend-izhk.onrender.com/api/v1
   ```

5. **Add Rewrite Rule** (for React Router):
   - Go to "Redirects/Rewrites" tab
   - Add rule: `/* → /index.html` (200 rewrite)

6. Click "Create Static Site"

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | Server port | Yes | `10000` |
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for JWT tokens | Yes | Random 32+ char string |
| `ENCRYPTION_KEY` | AES-256 encryption key (32 chars) | Yes | Random 32 char string |
| `CORS_ORIGIN` | Allowed frontend origins | Yes | `https://wealthmax-frontend.onrender.com` |
| `SMTP_HOST` | Email server host | No* | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | No* | `587` |
| `SMTP_SECURE` | Use TLS | No* | `false` |
| `SMTP_USER` | Email account | No* | `your@gmail.com` |
| `SMTP_PASS` | Email password/app password | No* | Gmail app password |
| `EMAIL_FROM` | Sender email address | No* | `WealthMax <noreply@wealthmax.com>` |
| `LOG_LEVEL` | Logging verbosity | No | `info` |
| `MFAPI_BASE_URL` | Mutual fund API | No | `https://api.mfapi.in` |
| `PUPPETEER_EXECUTABLE_PATH` | Chrome path for PDF generation | No | `/usr/bin/google-chrome-stable` |
| `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` | Skip Chromium download | No | `true` |

\* Required for email OTP functionality

### Frontend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API URL | Yes | `https://wealthmax-backend-izhk.onrender.com/api/v1` |

## Generating Secure Secrets

For `JWT_SECRET` and `ENCRYPTION_KEY`, use a secure random string generator:

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Using OpenSSL:**
```bash
openssl rand -hex 32
```

**Using PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Gmail App Password Setup

1. Go to your [Google Account](https://myaccount.google.com/)
2. Select "Security"
3. Enable "2-Step Verification" (if not already enabled)
4. Go back to Security → "App passwords"
5. Generate a new app password for "Mail"
6. Copy the 16-character password
7. Use this as `SMTP_PASS` in environment variables

## Troubleshooting

### 404 Errors

**Symptom**: Frontend shows 404 when calling API endpoints

**Causes & Solutions**:

1. **Frontend can't reach backend**
   - Check `VITE_API_BASE_URL` is set correctly in frontend environment variables
   - Verify backend URL includes `/api/v1` suffix
   - Check browser console for actual URL being called

2. **API route not found**
   - Verify backend is running: visit `https://wealthmax-backend-izhk.onrender.com/api/v1/health`
   - Check backend logs for route registration messages
   - Ensure all routes use `/api/v1` prefix

3. **React Router 404**
   - Add rewrite rule in frontend: `/* → /index.html`

### 500 Errors

**Symptom**: API calls return Internal Server Error

**Causes & Solutions**:

1. **Database connection failed**
   - Check `DATABASE_URL` is correct
   - Verify database is running and accessible
   - Check backend logs for connection errors

2. **Missing environment variables**
   - Review backend logs for which variables are missing
   - Ensure all required env vars are set
   - Restart backend service after adding env vars

3. **Migration not run**
   - Run migrations via Shell: `npm run migrate:up`
   - Check if tables exist in database

### CORS Errors

**Symptom**: Browser console shows CORS policy errors

**Causes & Solutions**:

1. **Frontend URL not in CORS_ORIGIN**
   - Update `CORS_ORIGIN` to include exact frontend URL
   - Multiple origins: `https://frontend1.com,https://frontend2.com`
   - Check for trailing slashes (should not have them)

2. **Credentials not allowed**
   - Backend already includes `credentials: true`
   - Verify frontend axios calls include `withCredentials: true` if needed

### Email OTP Not Working

**Symptom**: Email OTP not received

**Causes & Solutions**:

1. **SMTP not configured**
   - Verify all SMTP_* environment variables are set
   - Check Gmail app password is correct (not regular password)
   - Test email sending from backend logs

2. **Gmail blocking**
   - Use App Password, not regular password
   - Check Gmail security settings
   - Try with different email provider

### PDF Generation Fails

**Symptom**: Download report returns error

**Causes & Solutions**:

1. **Puppeteer/Chrome not found**
   - Ensure `PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable`
   - Ensure `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
   - Render free tier includes Chrome

2. **Memory limits**
   - PDF generation is memory-intensive
   - Consider upgrading Render plan if needed
   - Check backend logs for out-of-memory errors

## Health Check

To verify your deployment is working:

1. **Backend Health**
   ```bash
   curl https://wealthmax-backend-izhk.onrender.com/api/v1/health
   ```
   Expected response:
   ```json
   {
     "success": true,
     "data": {
       "status": "healthy",
       "timestamp": "2026-01-30T10:30:00.000Z",
       "database": "connected"
     }
   }
   ```

2. **Frontend Access**
   - Visit https://wealthmax-frontend.onrender.com
   - Should load login/signup page
   - Check browser console for errors

3. **Full Flow Test**
   - Register new account
   - Verify email OTP sent and works
   - Complete onboarding wizard
   - Check dashboard loads

## Monitoring

### Render Dashboard

- View logs: Service → "Logs" tab
- Monitor metrics: Service → "Metrics" tab
- Shell access: Service → "Shell" tab

### Key Metrics to Watch

- **Response time**: Should be < 1s for most endpoints
- **Error rate**: Should be < 1%
- **Memory usage**: Free tier has 512 MB limit
- **Database connections**: Monitor for connection leaks

## Updating Deployment

### Code Changes

1. Push changes to GitHub
2. Render auto-deploys on push (if enabled)
3. Or manually trigger: Service → "Manual Deploy" → "Deploy latest commit"

### Environment Variable Changes

1. Go to Service → "Environment" tab
2. Update variable value
3. Service will automatically restart

### Database Migrations

After adding new migrations:
```bash
# In Render Shell
cd backend
npm run migrate:up
```

## Cost Optimization (Free Tier)

Render free tier limitations:
- Services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month (enough for one service 24/7)

**Tips**:
- Use cron-job.org to ping `/api/v1/health` every 10 minutes
- Combine backend + frontend in same repository
- Use Render PostgreSQL free tier

## Security Checklist

- [ ] Use strong JWT_SECRET and ENCRYPTION_KEY
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set secure CORS_ORIGIN (no wildcards in production)
- [ ] Use Gmail App Password, not regular password
- [ ] Regularly rotate secrets
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated

## Support

If you encounter issues not covered in this guide:

1. Check Render service logs for errors
2. Review backend/frontend console logs
3. Verify all environment variables are set correctly
4. Check the troubleshooting section above
5. Contact Render support for platform-specific issues

## Next Steps

After successful deployment:

1. Set up custom domain (optional)
2. Configure automated backups for database
3. Set up monitoring/alerting
4. Add more comprehensive logging
5. Implement CI/CD pipeline
