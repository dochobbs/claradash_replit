# Deployment Guide

Complete guide for deploying CareAgentDashboard to production and other environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Deploying to Replit](#deploying-to-replit)
4. [Deploying to Other Platforms](#deploying-to-other-platforms)
5. [Database Setup](#database-setup)
6. [Monitoring & Logging](#monitoring--logging)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

### Code Quality
- [ ] All TypeScript errors resolved (`npm run check`)
- [ ] No console.log statements in production code
- [ ] Error handling implemented for all API endpoints
- [ ] Input validation on all endpoints
- [ ] CORS configuration for your domain

### Security
- [ ] Authentication system implemented
- [ ] Authorization/RBAC configured
- [ ] API rate limiting enabled
- [ ] HTTPS enforced
- [ ] Environment variables properly configured
- [ ] Sensitive data not exposed in responses
- [ ] SQL injection prevention verified
- [ ] XSS prevention in place

### Database
- [ ] Migrations tested in staging
- [ ] Backups automated
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Production database credentials secured

### Performance
- [ ] Build tested (`npm run build`)
- [ ] Asset sizes optimized
- [ ] Database query performance reviewed
- [ ] Caching strategy implemented
- [ ] Load testing completed

### Compliance
- [ ] HIPAA readiness assessment complete
- [ ] Audit logging implemented
- [ ] Data retention policies defined
- [ ] Privacy policy updated
- [ ] Terms of service reviewed

---

## Environment Configuration

### Environment Variables

Create a `.env.production` file with:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/claradash_prod

# API Keys
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=sk-your-key-here

# Server
PORT=5000
NODE_ENV=production

# Security
JWT_SECRET=your-secret-key-change-this
ALLOWED_ORIGINS=https://yourdomain.com

# Logging
LOG_LEVEL=info
SENTRY_DSN=https://your-sentry-dsn

# Optional
REDIS_URL=redis://localhost:6379
```

### Environment-Specific Settings

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| NODE_ENV | development | staging | production |
| PORT | 5000 | 5000 | 5000 |
| LOG_LEVEL | debug | info | warn |
| Database | Local | Staging DB | Production DB |
| API Keys | Test keys | Staging keys | Prod keys |

### Secrets Management

⚠️ **Never commit `.env` files to Git**

1. Add to `.gitignore`:
   ```
   .env
   .env.local
   .env.*.local
   ```

2. Use secure secret storage:
   - Replit: Secrets tab in project settings
   - Heroku: Config variables
   - AWS: Secrets Manager
   - Railway: Environment variables

3. For local development, use `.env.local` (not tracked by Git)

---

## Deploying to Replit

### Initial Deployment

1. **Connect GitHub Repository**
   ```bash
   # In Replit, click "Connect to GitHub"
   # Select: dochobbs/claradash_replit
   # Replit will auto-detect and set up
   ```

2. **Configure Secrets**
   - Click "Secrets" button in left sidebar
   - Add these secrets:
     - `DATABASE_URL`: Your Neon PostgreSQL URL
     - `AI_INTEGRATIONS_OPENAI_API_KEY`: Your OpenAI API key
     - `AI_INTEGRATIONS_OPENAI_BASE_URL`: https://api.openai.com/v1

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Migrations**
   ```bash
   npm run db:push
   ```

5. **Start Application**
   ```bash
   npm run dev
   ```

6. **Access Application**
   - Replit provides a public URL (e.g., `https://claradash-replit.user.repl.co`)

### Production Build on Replit

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Database on Replit

#### Option 1: Neon Serverless (Recommended)

1. Create account at https://neon.tech
2. Create a new PostgreSQL database
3. Copy connection string: `postgresql://...`
4. Set as `DATABASE_URL` secret in Replit

Benefits:
- ✅ Serverless (no server management)
- ✅ Automatic scaling
- ✅ Backup & recovery built-in
- ✅ Free tier available

#### Option 2: Replit's PostgreSQL Module

1. In `.replit`, add PostgreSQL module:
   ```
   modules = ["nodejs-20", "postgresql-16"]
   ```

2. Start PostgreSQL:
   ```bash
   npm run db
   ```

3. Database URL:
   ```
   postgresql://postgres:password@localhost:5432/claradash
   ```

---

## Deploying to Other Platforms

### Vercel (Frontend) + Backend on Separate Service

Not ideal for monorepo, but possible:

1. **Split repositories** (frontend and backend)
2. Deploy frontend to Vercel
3. Deploy backend to Vercel Functions, Railway, or Render

### Railway

Modern platform with excellent PostgreSQL support.

1. **Create Account** at https://railway.app
2. **Connect GitHub**
   ```bash
   # Railway CLI
   railway login
   railway init
   ```

3. **Add PostgreSQL Plugin**
   - Click "Add Plugin"
   - Select "PostgreSQL"
   - Railway creates database automatically

4. **Deploy**
   ```bash
   railway up
   ```

5. **Configure Variables**
   ```bash
   # In Railway dashboard
   DATABASE_URL: (auto-set by PostgreSQL plugin)
   AI_INTEGRATIONS_OPENAI_API_KEY: sk-...
   NODE_ENV: production
   ```

### Heroku

Traditional platform with good Node.js support.

1. **Install Heroku CLI**
   ```bash
   brew tap heroku/brew && brew install heroku
   heroku login
   ```

2. **Create App**
   ```bash
   heroku create claradash-app
   ```

3. **Add PostgreSQL Add-on**
   ```bash
   heroku addons:create heroku-postgresql:standard-0
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### Render

Simple alternative to Heroku.

1. **Connect GitHub** at https://render.com
2. **Create Web Service**
   - Select: claradash_replit repository
   - Runtime: Node
   - Build command: `npm run build`
   - Start command: `npm run start`

3. **Add PostgreSQL Database**
   - Create new database
   - Copy connection string to `DATABASE_URL`

4. **Deploy**
   - Render auto-deploys on git push

### Docker (Self-Hosted)

For Kubernetes, VPS, or Docker Swarm:

1. **Create Dockerfile**
   ```dockerfile
   FROM node:20-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci

   COPY . .
   RUN npm run build

   EXPOSE 5000

   ENV NODE_ENV=production
   CMD ["npm", "run", "start"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'

   services:
     app:
       build: .
       ports:
         - "5000:5000"
       environment:
         DATABASE_URL: postgresql://claradash:password@db:5432/claradash
         NODE_ENV: production
       depends_on:
         - db

     db:
       image: postgres:16
       environment:
         POSTGRES_USER: claradash
         POSTGRES_PASSWORD: your-secure-password
         POSTGRES_DB: claradash
       volumes:
         - db_data:/var/lib/postgresql/data

   volumes:
     db_data:
   ```

3. **Run**
   ```bash
   docker-compose up -d
   ```

---

## Database Setup

### PostgreSQL Configuration

#### Connection Pooling

For production, use a connection pool (PgBouncer or equivalent):

```
Database Host: pgbouncer.example.com
Port: 6432
Pool Mode: transaction
Max Clients: 100
```

#### Backup Strategy

1. **Automated Daily Backups** (Neon, Heroku, Railway handle this)
2. **Manual Backups**
   ```bash
   # Backup database
   pg_dump $DATABASE_URL > backup.sql

   # Restore database
   psql $DATABASE_URL < backup.sql
   ```

3. **Point-in-Time Recovery** (PITR)
   - Keep WAL (Write-Ahead Log) archives
   - Restore to any point in time

#### Migrations in Production

1. **Test migrations** in staging first
2. **Backup production database** before running migrations
3. **Run migrations**
   ```bash
   npm run db:push
   ```
4. **Verify** all tables and data integrity
5. **Monitor** application for errors

### Performance Tuning

```sql
-- Add indexes (in Drizzle, or run directly)
CREATE INDEX idx_children_patient_id ON children(patient_id);
CREATE INDEX idx_ai_interactions_urgency ON ai_interactions(urgency_level);

-- Enable auto-analyze
ALTER TABLE ai_interactions SET (autovacuum_analyze_scale_factor = 0.01);

-- Connection pooling
-- Use PgBouncer with transaction pooling
```

---

## Monitoring & Logging

### Application Logging

Setup structured logging:

```typescript
// server/index.ts
const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...data
    }));
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    }));
  }
};
```

### Error Tracking

Setup Sentry for error monitoring:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// In Express error handler
app.use((err: any, req: Request, res: Response) => {
  Sentry.captureException(err);
  res.status(500).json({ error: "Internal server error" });
});
```

### Database Monitoring

Monitor using built-in tools:

```bash
# Slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;

# Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Active connections
SELECT datname, usename, state, count(*)
FROM pg_stat_activity
GROUP BY datname, usename, state;
```

### Uptime Monitoring

Services to monitor application uptime:

- **UptimeRobot**: Free monitoring (5-minute intervals)
- **Pingdom**: Comprehensive uptime monitoring
- **Datadog**: Full observability platform
- **New Relic**: APM and infrastructure monitoring

Configure health check endpoint:

```bash
# GET /health
curl http://localhost:5000/health
# Response: { "status": "ok", "timestamp": "2024-10-30T..." }
```

---

## Troubleshooting

### Deployment Issues

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run start
```

#### Database Connection Timeout
```bash
# Check connection string format
postgresql://user:password@host:5432/database

# Verify firewall allows port 5432
nc -zv database.host 5432

# Check PostgreSQL is running
psql -U user -h host -c "SELECT 1"
```

#### Out of Memory Errors

```bash
# Increase Node.js heap size
NODE_OPTIONS=--max-old-space-size=4096 npm run start

# Or in systemd service:
Environment="NODE_OPTIONS=--max-old-space-size=4096"
```

#### Build Failures

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build

# Check TypeScript errors
npm run check

# Check for build errors
npm run build 2>&1 | head -50
```

### Runtime Issues

#### High CPU Usage

1. Identify slow endpoint
   ```bash
   # Check logs for slow requests
   grep "GET\|POST" logs.txt | grep -oP 'in \K\d+(?=ms)' | sort -rn | head
   ```

2. Profile with Node.js
   ```bash
   node --prof server/index.js
   node --prof-process isolate-*.log > profile.txt
   ```

3. Optimize query
   - Add database indexes
   - Implement pagination
   - Use aggregation instead of loading all data

#### High Memory Usage

1. Check for memory leaks
   ```bash
   # Using clinic.js
   npm install -g clinic
   clinic doctor -- node server/index.js
   ```

2. Common causes:
   - Unbounded cache growth
   - Memory leak in dependency
   - Large data structures kept in memory

3. Solutions:
   - Implement cache size limits
   - Use streaming for large responses
   - Paginate database queries

#### Slow Database Queries

```bash
# Enable slow query log
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

# Analyze query
EXPLAIN ANALYZE SELECT ...;

# Add indexes based on analysis
```

---

## Scaling Considerations

### Horizontal Scaling

For multiple application instances:

1. **Use Load Balancer**
   - Nginx, HAProxy, or cloud provider load balancer
   - Route traffic evenly to instances

2. **Stateless Application**
   - Don't store user state in memory
   - Use Redis for sessions if needed

3. **Shared Database**
   - All instances connect to same PostgreSQL
   - Connection pooling is critical

### Caching Layer

Add Redis for performance:

```typescript
import Redis from 'redis';

const redis = Redis.createClient({
  url: process.env.REDIS_URL
});

// Cache stats query
app.get("/api/stats", async (req, res) => {
  const cached = await redis.get('stats');
  if (cached) return res.json(JSON.parse(cached));

  const stats = await computeStats();
  await redis.setex('stats', 60, JSON.stringify(stats)); // 60 second TTL
  res.json(stats);
});
```

### Read Replicas

For read-heavy applications:

```typescript
// Primary for writes
const primary = new Pool({ connectionString: process.env.DATABASE_URL });

// Replica for reads
const replica = new Pool({ connectionString: process.env.REPLICA_DATABASE_URL });

// Use replica for SELECT queries
const patients = await replica.query("SELECT * FROM patients");
```

---

## Rollback & Recovery

### Zero-Downtime Deployments

1. **Blue-Green Deployment**
   - Deploy new version to separate environment
   - Switch traffic after verification
   - Keep old version for quick rollback

2. **Canary Deployments**
   - Deploy to 5% of traffic
   - Monitor error rate
   - Gradually increase to 100%

3. **Database Migrations**
   - Use backward-compatible migrations
   - Don't drop columns/tables immediately
   - Can rollback without data loss

### Emergency Rollback

```bash
# If deployment fails:
git revert <commit-hash>
git push

# Redeploy from previous version
npm run build
npm run start

# Restore database if needed
psql $DATABASE_URL < backup.sql
```

---

## Security in Production

### HTTPS/TLS

```bash
# Replit: Automatic HTTPS
# Railway/Heroku/Render: Automatic HTTPS

# Self-hosted with Let's Encrypt:
certbot certonly --standalone -d yourdomain.com
```

### Environment Variables

Never expose in logs:
```typescript
// ❌ Don't do this
console.log(`Connected to ${process.env.DATABASE_URL}`);

// ✅ Do this
console.log(`Connected to database`);
```

### API Security Headers

```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});
```

---

## Support & Documentation

For deployment help:
- [Replit Docs](https://docs.replit.com)
- [Railway Docs](https://docs.railway.app)
- [Heroku Docs](https://devcenter.heroku.com)
- [Neon Docs](https://neon.tech/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## Deployment Checklist Template

```markdown
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Security review completed
- [ ] Performance testing passed
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Error tracking enabled
- [ ] HTTPS verified
- [ ] Health check endpoint working
- [ ] Logs accessible
- [ ] Rollback plan documented
- [ ] Team trained on deployment process
```

Remember: **Test deployments in staging first!**
