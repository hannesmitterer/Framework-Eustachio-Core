# 🚀 Deployment Guide - Framework Eustachio

**Version**: 1.0.0  
**Last Updated**: January 17, 2026

This guide provides comprehensive instructions for deploying the Framework Eustachio dashboard and IPFS infrastructure.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Quick Start](#quick-start)
4. [GitHub Pages Deployment](#github-pages-deployment)
5. [Self-Hosted Deployment](#self-hosted-deployment)
6. [IPFS Configuration](#ipfs-configuration)
7. [Environment Variables](#environment-variables)
8. [Security Considerations](#security-considerations)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Minimum Requirements

**For Basic Deployment (Static Hosting)**:
- Web server capable of serving static files (Apache, Nginx, or similar)
- HTTPS certificate (recommended for security)
- Modern web browser support (Chrome 90+, Firefox 88+, Safari 14+)

**For IPFS Integration**:
- Infura IPFS API credentials (optional, for production use)
- OR access to a public IPFS gateway

**For Development**:
- Node.js 14+ (optional, only for local development)
- Git for version control

---

## 🎯 Deployment Options

The Framework Eustachio supports multiple deployment strategies:

### Option 1: GitHub Pages (Easiest)
- ✅ Free hosting
- ✅ Automatic HTTPS
- ✅ CDN distribution
- ✅ Zero configuration
- ⚠️ Public repositories only (for free tier)

### Option 2: Static Host (Netlify, Vercel, Cloudflare Pages)
- ✅ Free tier available
- ✅ Automatic deployments
- ✅ Custom domains
- ✅ Edge caching

### Option 3: Self-Hosted (Your Server)
- ✅ Full control
- ✅ Privacy
- ✅ Custom configuration
- ⚠️ Requires server management

### Option 4: IPFS-Only Deployment
- ✅ Fully decentralized
- ✅ Censorship resistant
- ✅ Permanent hosting
- ⚠️ Requires IPFS node or gateway

---

## 🚀 Quick Start

### Deploy in 5 Minutes

1. **Clone the repository**:
```bash
git clone https://github.com/hannesmitterer/Framework-Eustachio-Core.git
cd Framework-Eustachio-Core
```

2. **Open `index.html` in a browser**:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

3. **Test locally**:
   - The dashboard should load
   - IPFS will operate in **simulation mode** (no credentials needed)
   - Try sending a message to see simulated CIDs

4. **Deploy to a host** (see specific sections below)

---

## 🌐 GitHub Pages Deployment

### Method 1: Via GitHub Web Interface

1. **Push your code to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select branch: `main` (or your PR branch)
   - Select folder: `/ (root)`
   - Click **Save**

3. **Access your site**:
   - Your site will be available at: `https://<username>.github.io/<repository-name>/`
   - Example: `https://hannesmitterer.github.io/Framework-Eustachio-Core/`

### Method 2: Custom Domain

1. **Add a `CNAME` file** to the repository root:
```bash
echo "framework.eustachio.org" > CNAME
```

2. **Configure DNS** at your domain registrar:
   - Add a CNAME record pointing to `<username>.github.io`
   - Example: `framework.eustachio.org` → `hannesmitterer.github.io`

3. **Enable HTTPS** in GitHub Pages settings

---

## 🖥️ Self-Hosted Deployment

### Using Nginx

1. **Install Nginx**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# macOS
brew install nginx
```

2. **Configure Nginx**:
Create `/etc/nginx/sites-available/eustachio`:

```nginx
server {
    listen 80;
    server_name framework.eustachio.org;

    root /var/www/framework-eustachio;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # CORS for IPFS
    add_header Access-Control-Allow-Origin "*";
}
```

3. **Enable the site**:
```bash
sudo ln -s /etc/nginx/sites-available/eustachio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **Copy files**:
```bash
sudo mkdir -p /var/www/framework-eustachio
sudo cp -r * /var/www/framework-eustachio/
sudo chown -R www-data:www-data /var/www/framework-eustachio
```

5. **Enable HTTPS** with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d framework.eustachio.org
```

### Using Apache

1. **Install Apache**:
```bash
sudo apt update
sudo apt install apache2
```

2. **Create VirtualHost**:
Create `/etc/apache2/sites-available/eustachio.conf`:

```apache
<VirtualHost *:80>
    ServerName framework.eustachio.org
    DocumentRoot /var/www/framework-eustachio

    <Directory /var/www/framework-eustachio>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"

    ErrorLog ${APACHE_LOG_DIR}/eustachio_error.log
    CustomLog ${APACHE_LOG_DIR}/eustachio_access.log combined
</VirtualHost>
```

3. **Enable and restart**:
```bash
sudo a2ensite eustachio
sudo a2enmod headers
sudo systemctl reload apache2
```

---

## 🌌 IPFS Configuration

### Production Mode with Infura

1. **Get Infura credentials**:
   - Sign up at https://infura.io/
   - Create a new IPFS project
   - Copy your **Project ID** and **Project Secret**

2. **Configure credentials**:

**Option A: Environment Variables** (recommended):
```bash
export INFURA_PROJECT_ID="your_project_id_here"
export INFURA_PROJECT_SECRET="your_project_secret_here"
```

**Option B: JavaScript Configuration**:
Create a `config.js` file:
```javascript
window.INFURA_PROJECT_ID = 'your_project_id_here';
window.INFURA_PROJECT_SECRET = 'your_project_secret_here';
```

Include before `script.js` in `index.html`:
```html
<script src="config.js"></script>
<script src="script.js"></script>
```

3. **Test the connection**:
   - Open the dashboard
   - Send a test message
   - Verify you get a **real CID** (not simulated)
   - Click the IPFS link to verify the content

### Alternative: Public Gateway

If you don't want to use Infura:

```javascript
window.IPFS_API_HOST = 'ipfs.io';
window.IPFS_API_PORT = 443;
window.IPFS_API_PROTOCOL = 'https';
```

**Note**: Public gateways may have rate limits and slower performance.

### Self-Hosted IPFS Node

For complete decentralization:

1. **Install IPFS**:
```bash
wget https://dist.ipfs.tech/kubo/v0.17.0/kubo_v0.17.0_linux-amd64.tar.gz
tar -xvzf kubo_v0.17.0_linux-amd64.tar.gz
cd kubo
sudo bash install.sh
```

2. **Initialize IPFS**:
```bash
ipfs init
ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
```

3. **Run IPFS daemon**:
```bash
ipfs daemon &
```

4. **Configure the dashboard**:
```javascript
window.IPFS_API_HOST = 'localhost'; // or your server IP
window.IPFS_API_PORT = 5001;
window.IPFS_API_PROTOCOL = 'http'; // or https if configured
```

---

## 🔐 Environment Variables

### Required Variables (Production)

```bash
# IPFS Configuration
INFURA_PROJECT_ID="your_infura_project_id"
INFURA_PROJECT_SECRET="your_infura_project_secret"
```

### Optional Variables

```bash
# Alternative IPFS Gateway
IPFS_API_HOST="ipfs.io"
IPFS_API_PORT="443"
IPFS_API_PROTOCOL="https"

# Analytics (if implemented)
ANALYTICS_ID="your_analytics_id"

# Environment
NODE_ENV="production"  # or "development"
```

### Setting Variables in Different Environments

**Linux/macOS**:
```bash
export INFURA_PROJECT_ID="..."
```

Add to `~/.bashrc` or `~/.zshrc` for persistence.

**Windows**:
```cmd
set INFURA_PROJECT_ID=...
```

**Docker**:
```yaml
environment:
  - INFURA_PROJECT_ID=your_id
  - INFURA_PROJECT_SECRET=your_secret
```

**Netlify/Vercel**:
- Go to site settings
- Add environment variables in the dashboard
- Redeploy

---

## 🔒 Security Considerations

### HTTPS is Essential

**Always use HTTPS in production**:
- Protects data in transit
- Required for modern web APIs
- Builds user trust

### Content Security Policy

Add to your `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline'; 
               connect-src 'self' https://ipfs.infura.io https://ipfs.io;">
```

### API Key Protection

**Never commit API keys to Git**:
```bash
# Add to .gitignore
config.js
.env
*.key
```

**Use environment variables**:
- In production, inject via server config
- Never expose in client-side code
- Rotate keys periodically

### Subresource Integrity (SRI)

The CDN script already includes SRI hash:
```html
<script src="https://cdn.jsdelivr.net/npm/ipfs-http-client@60.0.1/dist/index.min.js"
        integrity="sha384-..." 
        crossorigin="anonymous"></script>
```

Verify this hash periodically.

---

## 📊 Monitoring and Maintenance

### Health Checks

Create a simple monitoring script:

```bash
#!/bin/bash
# monitor.sh

URL="https://framework.eustachio.org"
EXPECTED="KOSYMBIOSIS DASHBOARD"

RESPONSE=$(curl -s $URL | grep "$EXPECTED")

if [ -z "$RESPONSE" ]; then
    echo "❌ Site is DOWN or content changed"
    # Send alert (email, Slack, etc.)
else
    echo "✅ Site is UP"
fi
```

Run via cron:
```bash
*/5 * * * * /path/to/monitor.sh
```

### Log Monitoring

**Nginx logs**:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Apache logs**:
```bash
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/apache2/error.log
```

### Performance Optimization

1. **Enable gzip compression** (Nginx):
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

2. **Browser caching**:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **CDN usage**:
   - Use Cloudflare or similar
   - Configure caching rules
   - Enable Brotli compression

---

## 🔧 Troubleshooting

### Problem: IPFS Connection Fails

**Symptoms**:
- "SISTEMA: Errore: Impossibile connettersi a IPFS"
- Messages show simulated CIDs

**Solutions**:
1. Check Infura credentials are correct
2. Verify network connectivity to Infura
3. Check browser console for CORS errors
4. Try public gateway as fallback

### Problem: Blank Page

**Symptoms**:
- Page doesn't load
- White screen

**Solutions**:
1. Check browser console for errors
2. Verify all files are uploaded correctly
3. Check file permissions (should be readable)
4. Verify web server configuration

### Problem: CDN Script Fails to Load

**Symptoms**:
- Error: "IpfsHttpClient is not defined"

**Solutions**:
1. Check CDN availability
2. Verify SRI hash is correct
3. Try different CDN mirror
4. Consider hosting library locally

### Problem: XSS Warning

**Symptoms**:
- Content Security Policy errors

**Solutions**:
1. Update CSP headers
2. Verify `textContent` is used (not `innerHTML`)
3. Check for unsafe eval usage
4. Review third-party scripts

### Getting Help

If you encounter issues:

1. **Check documentation**: README.md, CHARTER.md
2. **Search issues**: GitHub Issues page
3. **Ask community**: Community forum (coming soon)
4. **File a bug report**: GitHub Issues with:
   - Browser and version
   - Error messages
   - Steps to reproduce

---

## 📚 Additional Resources

- [IPFS Documentation](https://docs.ipfs.tech/)
- [Infura IPFS API](https://docs.infura.io/ipfs)
- [GitHub Pages Guide](https://docs.github.com/en/pages)
- [Let's Encrypt](https://letsencrypt.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## 🎉 Deployment Checklist

Before going live:

- [ ] Test all functionality locally
- [ ] Configure HTTPS certificate
- [ ] Set environment variables
- [ ] Test IPFS connection (real upload)
- [ ] Verify security headers
- [ ] Enable monitoring
- [ ] Set up backups
- [ ] Document custom configuration
- [ ] Test on multiple browsers
- [ ] Perform security audit
- [ ] Update DNS (if using custom domain)
- [ ] Announce to community

---

**Deployed under the Charter of Kosymbiosis (CoK)**  
**For questions**: Open an issue on GitHub

© 2026 Framework Eustachio | Lex Amoris Open License
