# WhatsApp Admin Integration

Complete WhatsApp messaging platform integrated into your admin panel with full API support for sending and receiving messages.

## 📋 Features

✅ **Two-way messaging** - Send and receive WhatsApp messages  
✅ **Multiple message types** - Text, buttons (interactive), and templates  
✅ **Real-time inbox** - Auto-refreshing message history  
✅ **Admin dashboard** - Beautiful UI integrated into your existing admin panel  
✅ **Complete API** - RESTful endpoints for programmatic access  
✅ **Message storage** - Persistent conversation history  
✅ **Status tracking** - Track message delivery status  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Panel (Next.js)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /admin/whatsapp                                       │ │
│  │  • Inbox Tab (view received messages)                 │ │
│  │  • Send Tab (send text/buttons/templates)             │ │
│  │  • API Documentation                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ▼                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Next.js API Routes                                    │ │
│  │  • /api/whatsapp/send       → Send messages            │ │
│  │  • /api/whatsapp/messages   → Get message history      │ │
│  │  • /api/whatsapp/webhook    → Receive Meta webhooks    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              WA Service (Express.js)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Routes:                                               │ │
│  │  • POST /send/text      → Send text message            │ │
│  │  • POST /send/buttons   → Send button message          │ │
│  │  • POST /send/template  → Send template message        │ │
│  │  • GET/POST /webhook    → Meta webhook handler         │ │
│  │  • GET /admin-api/messages → Get stored messages       │ │
│  │  • GET /admin-api/stats    → Get statistics            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ▼
                    Meta Cloud API (WhatsApp)
```

---

## 🚀 Setup Instructions

### 1. Configure Environment Variables

#### WA Service (`E:/Projects/WA/.env`)
```env
WHATSAPP_TOKEN=your_meta_access_token
WEBHOOK_VERIFY_TOKEN=tmi_webhook_2026
PHONE_NUMBER_ID=your_phone_number_id
PORT=3001
NODE_ENV=production
```

#### Admin Panel (`E:/Projects/tauqeer-inc/frontend/.env.local`)
```env
WA_SERVICE_URL=http://localhost:3001
WEBHOOK_VERIFY_TOKEN=tmi_webhook_2026
```

### 2. Start the WA Service

```bash
cd E:/Projects/WA
npm install
npm start
```

The service will run on **http://localhost:3001**

### 3. Start the Admin Panel

```bash
cd E:/Projects/tauqeer-inc/frontend
npm install
npm run dev
```

The admin panel will run on **http://localhost:3000**

### 4. Access WhatsApp Manager

Navigate to: **http://localhost:3000/admin/whatsapp**

---

## 📱 Using the Admin Panel

### Inbox Tab

- **View all messages** - Inbound and outbound messages with timestamps
- **Real-time updates** - Auto-refreshes every 5 seconds
- **Color coding**:
  - 🔵 Blue = Inbound (received from users)
  - 🟢 Green = Outbound (sent by admin)
- **Message details** - Type, status, sender/recipient info

### Send Tab

#### 1. **Text Messages**
- Simple text messages with WhatsApp markdown support
- Supports: `*bold*`, `_italic_`, `~strikethrough~`

#### 2. **Button Messages**
- Interactive messages with up to 3 quick-reply buttons
- Each button has an ID and title
- Optional footer text

#### 3. **Template Messages**
- Pre-approved Meta templates only
- Must be created in Meta Business Manager first
- Used for business-initiated conversations

---

## 🔌 API Reference

### Send Text Message

```bash
POST http://localhost:3000/api/whatsapp/send
Content-Type: application/json

{
  "type": "text",
  "to": "923001234567",
  "message": "Hello from Tauqeer Inc!"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "wamid.xxx",
  "message": "Message sent successfully"
}
```

### Send Button Message

```bash
POST http://localhost:3000/api/whatsapp/send
Content-Type: application/json

{
  "type": "buttons",
  "to": "923001234567",
  "bodyText": "Choose an option:",
  "footerText": "Tauqeer Inc",
  "buttons": [
    {"id": "opt_1", "title": "Option 1"},
    {"id": "opt_2", "title": "Option 2"},
    {"id": "opt_3", "title": "Option 3"}
  ]
}
```

### Send Template Message

```bash
POST http://localhost:3000/api/whatsapp/send
Content-Type: application/json

{
  "type": "template",
  "to": "923001234567",
  "template": "order_confirmation",
  "language": "en_US"
}
```

### Get Message History

```bash
GET http://localhost:3000/api/whatsapp/messages
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "wamid.xxx",
      "from": "923001234567",
      "to": "business",
      "type": "text",
      "body": "Hello!",
      "timestamp": "2026-08-16T10:30:00.000Z",
      "direction": "inbound"
    }
  ],
  "count": 1
}
```

---

## 🔧 WA Service Direct API

You can also call the WA service directly (bypass Next.js proxy):

### Text Message
```bash
POST http://localhost:3001/send/text
Content-Type: application/json

{
  "to": "923001234567",
  "message": "Your message here"
}
```

### Get Stored Messages
```bash
GET http://localhost:3001/admin-api/messages
```

### Get Statistics
```bash
GET http://localhost:3001/admin-api/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 42,
    "inbound": 28,
    "outbound": 14,
    "today": 5
  }
}
```

---

## 🌐 Production Deployment

### Deploy WA Service (Railway/Heroku)

1. **Set environment variables** in your hosting platform
2. **Configure webhook URL** in Meta Business Manager:
   - Webhook URL: `https://your-domain.com/webhook`
   - Verify token: `tmi_webhook_2026`
3. **Update Next.js env**:
   ```env
   WA_SERVICE_URL=https://your-wa-service.railway.app
   ```

### Meta Webhook Configuration

In Meta Business Manager → WhatsApp → Configuration:

1. **Callback URL**: `https://your-wa-service.com/webhook`
2. **Verify Token**: `tmi_webhook_2026`
3. **Subscribe to**: `messages`, `message_status`

---

## 📊 Features Overview

| Feature | Description | Status |
|---------|-------------|--------|
| Send Text | Plain text messages | ✅ |
| Send Buttons | Interactive quick replies | ✅ |
| Send Templates | Pre-approved templates | ✅ |
| Receive Messages | Webhook integration | ✅ |
| Message History | Persistent storage | ✅ |
| Real-time Updates | Auto-refresh inbox | ✅ |
| Status Tracking | Delivery status | ✅ |
| Admin UI | Beautiful dashboard | ✅ |
| API Access | RESTful endpoints | ✅ |
| CORS Support | Cross-origin requests | ✅ |

---

## 🔐 Security Notes

1. **Environment variables** - Never commit `.env` files
2. **Webhook token** - Use a strong, unique verify token
3. **Access control** - Admin panel protected by `AdminGuard`
4. **CORS** - Configured for your frontend domain
5. **API authentication** - Add authentication layer for production

---

## 🐛 Troubleshooting

### Messages not appearing in inbox?

1. Check WA service is running: `http://localhost:3001/health`
2. Verify webhook is configured in Meta Business Manager
3. Check console logs in both services

### Cannot send messages?

1. Verify `WA_SERVICE_URL` in frontend `.env.local`
2. Check phone number format: `923001234567` (no + or spaces)
3. Ensure Meta access token is valid

### CORS errors?

The WA service now includes CORS headers. If issues persist:
- Restart the WA service
- Check browser console for specific errors

---

## 📁 File Structure

```
E:/Projects/
├── WA/                                    # WhatsApp Service
│   ├── src/
│   │   ├── routes/
│   │   │   ├── webhook.js                # Meta webhook handler
│   │   │   ├── send.js                   # Send message endpoints
│   │   │   └── admin-api.js              # Admin panel API
│   │   ├── handlers/
│   │   │   ├── message.js                # Message router
│   │   │   ├── buttons.js                # Button responses
│   │   │   └── menus.js                  # Menu builders
│   │   ├── whatsapp.js                   # WhatsApp API client
│   │   └── config.js                     # Configuration
│   ├── webhook.js                        # Entry point
│   └── .env                              # Environment config
│
└── tauqeer-inc/
    └── frontend/
        ├── app/
        │   ├── admin/
        │   │   └── whatsapp/
        │   │       └── page.tsx          # WhatsApp admin page
        │   └── api/
        │       └── whatsapp/
        │           ├── send/route.ts     # Send API
        │           ├── messages/route.ts # Messages API
        │           └── webhook/route.ts  # Webhook receiver
        ├── hooks/
        │   └── useWhatsApp.ts            # React hooks
        └── components/
            └── admin/
                └── AdminSidebar.tsx      # Updated sidebar
```

---

## 🎯 Next Steps

- [ ] Add database persistence (MongoDB/PostgreSQL)
- [ ] Implement message search and filtering
- [ ] Add conversation threading by phone number
- [ ] Create message templates manager
- [ ] Add bulk messaging capability
- [ ] Implement scheduled messages
- [ ] Add analytics dashboard
- [ ] Create contact management system
- [ ] Add media support (images, videos, documents)
- [ ] Implement chatbot automation rules

---

## 📞 Support

For issues or questions:
- Email: contact@tauqeermustafa.tech
- Website: www.tauqeermustafa.tech

---

**Built with ❤️ by Tauqeer Mustafa Inc.**
