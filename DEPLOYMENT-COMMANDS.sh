```bash
# ============================================================
# 🚀 READY TO DEPLOY - Follow These Steps
# ============================================================

# ─────────────────────────────────────────────────────────
# STEP 1: Create GitHub Repository for WA Service
# ─────────────────────────────────────────────────────────

1. Go to: https://github.com/new
2. Repository name: whatsapp-service
3. Visibility: Private
4. Click "Create repository"
5. Copy the repository URL

# ─────────────────────────────────────────────────────────
# STEP 2: Push WA Service to GitHub
# ─────────────────────────────────────────────────────────

cd E:/Projects/WA

# Add your GitHub repository as remote
git remote add origin https://github.com/TauqeerMustafa/whatsapp-service.git

# Push to GitHub
git branch -M main
git push -u origin main

# ✅ WA Service is now on GitHub!

# ─────────────────────────────────────────────────────────
# STEP 3: Deploy WA Service to Render
# ─────────────────────────────────────────────────────────

1. Go to: https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect repository: whatsapp-service
4. Configure:
   Name: tmi-whatsapp-service
   Branch: main
   Build Command: npm install
   Start Command: npm start

5. Add Environment Variables:
   WHATSAPP_TOKEN=EAA5D14LMyusBSDAmu7r0LvZCG9iKJzLE8dnZATzsz6EN0QhtnN0wZB8ZC2ovfsP854fk9MixVgQZANWLTpnqdRaU8hqVuXXH32MfBglGat4rBXYXFryzOnyC8zSk8bP7HOkNVWFuC9HxFw2zZBvfaQBijUa9xU45Fg6qh96SETp8TCmDb00gD81I0UXbHj3mmPOQZDZD
   WEBHOOK_VERIFY_TOKEN=tmi_webhook_2026
   PHONE_NUMBER_ID=1211044558768028
   PORT=3001
   NODE_ENV=production

6. Click "Create Web Service"
7. Wait 2-3 minutes
8. Copy service URL (e.g., https://tmi-whatsapp-service.onrender.com)

# Test deployment:
curl https://tmi-whatsapp-service.onrender.com/health

# ─────────────────────────────────────────────────────────
# STEP 4: Update Frontend Environment Variables on Render
# ─────────────────────────────────────────────────────────

1. Go to Render dashboard
2. Find your frontend service
3. Go to "Environment" tab
4. Add these variables:
   WA_SERVICE_URL=https://tmi-whatsapp-service.onrender.com
   WEBHOOK_VERIFY_TOKEN=tmi_webhook_2026
5. Save (will auto-redeploy)

# ─────────────────────────────────────────────────────────
# STEP 5: Push Frontend Changes to GitHub
# ─────────────────────────────────────────────────────────

cd E:/Projects/tauqeer-inc

# Stage all WhatsApp files
git add frontend/app/admin/whatsapp/
git add frontend/app/api/whatsapp/
git add frontend/hooks/useWhatsApp.ts
git add frontend/components/admin/AdminSidebar.tsx
git add frontend/.env.local.example
git add *.md
git add *.txt
git add *.bat
git add *.sh

# Commit
git commit -m "feat(admin): add WhatsApp messaging platform

- WhatsApp admin page with inbox and send tabs
- API routes for message operations
- Real-time auto-refresh inbox
- Support for text, button, and template messages
- Complete REST API integration
- React hooks for WhatsApp operations

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"

# Push to GitHub (Render will auto-deploy)
git push origin master

# ─────────────────────────────────────────────────────────
# STEP 6: Configure Meta Webhook
# ─────────────────────────────────────────────────────────

1. Go to: https://business.facebook.com
2. WhatsApp → Configuration → Webhook
3. Update:
   Callback URL: https://tmi-whatsapp-service.onrender.com/webhook
   Verify Token: tmi_webhook_2026
4. Click "Verify and Save"
5. Subscribe to: messages, message_status

# ─────────────────────────────────────────────────────────
# STEP 7: Test Everything
# ─────────────────────────────────────────────────────────

# Test WA service health
curl https://tmi-whatsapp-service.onrender.com/health

# Test admin panel
# Visit: https://your-frontend.onrender.com/admin/whatsapp

# Send test message from admin panel UI
# Check inbox for the sent message

# Send WhatsApp message to your business number
# Should appear in admin panel inbox

# ✅ DONE! Your WhatsApp integration is live!

# ============================================================
# 📝 IMPORTANT URLS (Save These)
# ============================================================

WA Service: https://tmi-whatsapp-service.onrender.com
Frontend: https://your-frontend.onrender.com
Admin Panel: https://your-frontend.onrender.com/admin/whatsapp

GitHub:
- WA Service: https://github.com/TauqeerMustafa/whatsapp-service
- Frontend: https://github.com/TauqeerMustafa/tauqeermustafainc

# ============================================================
# 🐛 Troubleshooting
# ============================================================

# If admin panel shows connection errors:
# 1. Check WA_SERVICE_URL in Render environment variables
# 2. Verify WA service is running (curl health endpoint)
# 3. Check Render logs for errors

# If webhook not working:
# 1. Verify Meta webhook URL matches Render URL
# 2. Check verify token matches
# 3. Look at WA service logs in Render

# For detailed troubleshooting, see:
# - PRODUCTION-DEPLOYMENT.md
# - QUICK-DEPLOYMENT-RENDER.md

```
