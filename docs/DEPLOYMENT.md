# Deployment Guide

This document provides comprehensive instructions for deploying the EchoNote introduction page.

## Table of Contents

- [Overview](#overview)
- [GitHub Pages Deployment](#github-pages-deployment)
- [Manual Deployment](#manual-deployment)
- [Custom Domain Setup](#custom-domain-setup)
- [Environment Configuration](#environment-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Overview

The EchoNote introduction page is designed to be deployed as a static website. The primary deployment method is GitHub Pages with automated CI/CD through GitHub Actions.

### Deployment Architecture

```
Source Code (GitHub) → GitHub Actions → Build Process → GitHub Pages → CDN → Users
```

### Supported Deployment Platforms

1. **GitHub Pages** (Primary)
2. **Netlify** (Alternative)
3. **Vercel** (Alternative)
4. **Custom Server** (Manual)

## GitHub Pages Deployment

### Prerequisites

- GitHub repository with appropriate permissions
- GitHub Actions enabled
- Node.js 18+ for local development

### Automatic Deployment Setup

1. **Repository Configuration**

   ```bash
   # Ensure main branch is protected
   # Enable GitHub Pages in repository settings
   # Set source to "GitHub Actions"
   ```

2. **GitHub Actions Workflow**

   The deployment workflow is defined in `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'npm'

         - name: Install dependencies
           run: npm ci

         - name: Run tests
           run: npm run test

         - name: Build
           run: npm run build

         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           if: github.ref == 'refs/heads/main'
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. **Deployment Process**
   - Push to main branch triggers deployment
   - GitHub Actions runs build process
   - Built files are deployed to `gh-pages` branch
   - GitHub Pages serves the content

### Manual GitHub Pages Setup

If automatic deployment is not working:

1. **Build Locally**

   ```bash
   npm run build
   ```

2. **Deploy to gh-pages Branch**

   ```bash
   # Install gh-pages utility
   npm install -g gh-pages

   # Deploy
   gh-pages -d dist
   ```

3. **Configure GitHub Pages**
   - Go to repository Settings → Pages
   - Set source to "Deploy from a branch"
   - Select `gh-pages` branch

## Manual Deployment

### Building for Production

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Build for production
npm run build

# Preview build (optional)
npm run preview
```

### Build Output

The build process creates a `dist/` directory with:

```
dist/
├── index.html          # Main HTML file
├── assets/             # Compiled CSS and JS
│   ├── index-[hash].js
│   └── index-[hash].css
├── images/             # Optimized images
└── [other static files]
```

### Deployment to Custom Server

1. **Upload Files**

   ```bash
   # Using rsync
   rsync -avz --delete dist/ user@server:/path/to/webroot/

   # Using SCP
   scp -r dist/* user@server:/path/to/webroot/
   ```

2. **Web Server Configuration**

   **Apache (.htaccess)**

   ```apache
   # Enable compression
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/plain
     AddOutputFilterByType DEFLATE text/html
     AddOutputFilterByType DEFLATE text/xml
     AddOutputFilterByType DEFLATE text/css
     AddOutputFilterByType DEFLATE application/xml
     AddOutputFilterByType DEFLATE application/xhtml+xml
     AddOutputFilterByType DEFLATE application/rss+xml
     AddOutputFilterByType DEFLATE application/javascript
     AddOutputFilterByType DEFLATE application/x-javascript
   </IfModule>

   # Cache static assets
   <IfModule mod_expires.c>
     ExpiresActive on
     ExpiresByType text/css "access plus 1 year"
     ExpiresByType application/javascript "access plus 1 year"
     ExpiresByType image/png "access plus 1 year"
     ExpiresByType image/jpg "access plus 1 year"
     ExpiresByType image/jpeg "access plus 1 year"
     ExpiresByType image/gif "access plus 1 year"
     ExpiresByType image/svg+xml "access plus 1 year"
   </IfModule>

   # Security headers
   Header always set X-Frame-Options DENY
   Header always set X-Content-Type-Options nosniff
   Header always set Referrer-Policy "strict-origin-when-cross-origin"
   ```

   **Nginx**

   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     root /path/to/webroot;
     index index.html;

     # Gzip compression
     gzip on;
     gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

     # Cache static assets
     location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }

     # Security headers
     add_header X-Frame-Options DENY;
     add_header X-Content-Type-Options nosniff;
     add_header Referrer-Policy "strict-origin-when-cross-origin";

     # Handle client-side routing
     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

## Custom Domain Setup

### GitHub Pages Custom Domain

1. **Add CNAME File**

   ```bash
   echo "your-domain.com" > public/CNAME
   ```

2. **Configure DNS**

   **For Apex Domain (example.com)**

   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   ```

   **For Subdomain (www.example.com)**

   ```
   Type: CNAME
   Name: www
   Value: username.github.io
   ```

3. **Enable HTTPS**
   - Go to repository Settings → Pages
   - Check "Enforce HTTPS"

### Domain Verification

1. **Verify Domain Ownership**
   - Add TXT record to DNS
   - Verify in GitHub organization settings

2. **Test Configuration**

   ```bash
   # Check DNS propagation
   dig your-domain.com

   # Test HTTPS
   curl -I https://your-domain.com
   ```

## Environment Configuration

### Environment Variables

Create `.env` files for different environments:

**.env.development**

```bash
VITE_APP_TITLE=EchoNote (Development)
VITE_API_BASE_URL=http://localhost:3000
VITE_ANALYTICS_ID=
```

**.env.production**

```bash
VITE_APP_TITLE=EchoNote
VITE_API_BASE_URL=https://api.echonote.com
VITE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Build Configuration

**vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? '/echonote-introduction/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'vue-i18n'],
        },
      },
    },
  },
})
```

## CI/CD Pipeline

### GitHub Actions Workflow

The complete workflow includes:

1. **Code Quality Checks**
   - ESLint
   - TypeScript type checking
   - Prettier formatting

2. **Testing**
   - Unit tests
   - E2E tests
   - Accessibility tests

3. **Build Process**
   - Install dependencies
   - Build for production
   - Optimize assets

4. **Deployment**
   - Deploy to GitHub Pages
   - Update deployment status

### Workflow Configuration

**.github/workflows/deploy.yml**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint code
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### Branch Protection

Configure branch protection rules:

1. **Require pull request reviews**
2. **Require status checks to pass**
3. **Require branches to be up to date**
4. **Include administrators**

## Monitoring and Maintenance

### Performance Monitoring

1. **Lighthouse CI**

   ```yaml
   - name: Run Lighthouse CI
     run: |
       npm install -g @lhci/cli@0.12.x
       lhci autorun
   ```

2. **Web Vitals Monitoring**
   - Integrate with Google Analytics
   - Monitor Core Web Vitals
   - Set up alerts for performance degradation

### Deployment Monitoring

1. **GitHub Actions Notifications**
   - Configure Slack/Discord notifications
   - Set up email alerts for failures

2. **Uptime Monitoring**
   - Use services like UptimeRobot
   - Monitor site availability
   - Set up incident response

### Maintenance Tasks

**Daily**

- [ ] Check deployment status
- [ ] Monitor error logs
- [ ] Review performance metrics

**Weekly**

- [ ] Update dependencies
- [ ] Review security advisories
- [ ] Check for broken links

**Monthly**

- [ ] Performance optimization review
- [ ] Security audit
- [ ] Backup verification

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**

   ```bash
   # Check logs
   npm run build 2>&1 | tee build.log

   # Clear cache
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **GitHub Actions Failures**
   - Check workflow logs
   - Verify secrets configuration
   - Check branch protection rules

3. **Domain Issues**

   ```bash
   # Check DNS
   nslookup your-domain.com

   # Check HTTPS
   openssl s_client -connect your-domain.com:443
   ```

4. **Performance Issues**

   ```bash
   # Analyze bundle
   npm run analyze

   # Check image optimization
   npm run optimize-images
   ```

### Rollback Procedures

1. **Immediate Rollback**

   ```bash
   # Revert last commit
   git revert HEAD
   git push origin main
   ```

2. **Rollback to Specific Version**

   ```bash
   # Find commit hash
   git log --oneline

   # Revert to specific commit
   git revert <commit-hash>
   git push origin main
   ```

3. **Emergency Rollback**
   - Disable GitHub Pages temporarily
   - Deploy previous version manually
   - Investigate and fix issues

### Getting Help

1. **Check Documentation**
   - Review this deployment guide
   - Check GitHub Actions documentation
   - Review platform-specific guides

2. **Community Support**
   - GitHub Discussions
   - Stack Overflow
   - Platform-specific forums

3. **Professional Support**
   - GitHub Support (for GitHub-specific issues)
   - Platform support channels
   - DevOps consultants

---

**Last Updated**: November 2025
**Version**: 1.0.0

For questions or issues, please create an issue in the GitHub repository or reach out to the maintainers.
