# Corporate Work Profile Integration Guide: Android & Chrome with open.email

This operational document details how to configure **Android Enterprise Work Profiles** and **Google Chrome Managed Work Profiles** for your corporate domain (`tauqeermustafa.tech`), while retaining **open.email** as your primary email infrastructure.

---

## 1. System Architecture Overview

```
                          ┌──────────────────────────────────────────────┐
                          │          tauqeermustafa.tech (Domain)        │
                          └──────────────────────┬───────────────────────┘
                                                 │
                   ┌─────────────────────────────┴─────────────────────────────┐
                   ▼                                                           ▼
       [DNS MX Records: open.email]                                [DNS TXT Record: Google]
                   │                                                           │
                   ▼                                                           ▼
     ┌───────────────────────────┐                               ┌───────────────────────────┐
     │        open.email         │                               │ Google Cloud Identity     │
     │   - REST API & Mailboxes  │                               │   (Free: up to 50 users)  │
     │   - Inbound/Outbound Mail │                               │   - Android Enterprise DPC│
     │   - Webmail & Portal Sync │                               │   - Chrome Enterprise Core│
     └───────────────────────────┘                               └─────────────┬─────────────┘
                                                                               │
                                                 ┌─────────────────────────────┴─────────────────────────────┐
                                                 ▼                                                           ▼
                                    ┌───────────────────────────┐                               ┌───────────────────────────┐
                                    │    Android Work Profile   │                               │    Google Chrome Profile  │
                                    │  - Briefcase (💼) sandbox │                               │  - Separated Work Profile │
                                    │  - Zero access to personal│                               │  - Dedicated tabs & cache │
                                    │  - TMI Android APK bridge │                               │  - open.email web sessions│
                                    └───────────────────────────┘                               └───────────────────────────┘
```

---

## 2. Why open.email and Google Work Profiles Work Together

- **Email Delivery (MX Records)**: Remains 100% routed through **open.email**. Sending, receiving, and storage are unaffected.
- **Identity & Device Management (TXT Record)**: Google Cloud Identity verifies ownership of `@tauqeermustafa.tech` via a single DNS TXT record.
- **Android OS**: When an employee signs in with `@tauqeermustafa.tech`, Android contacts Google's Enterprise DPC, detects mobile management, and automatically builds the sandboxed **Work Profile (💼)**.
- **Google Chrome**: Detects the verified domain and prompts to **Create a Work Profile** to isolate company browsing from personal browsing.

---

## 3. Step-by-Step Setup: Google Cloud Identity (Free)

Google Cloud Identity Free provides enterprise identity and device management for up to 50 users at **$0 cost**.

### Step 3.1: Sign Up for Cloud Identity Free
1. Go to: [Google Cloud Identity Free Signup](https://gsuite.google.com/signup/gcpidentity/welcome)
2. Enter your business name: `Tauqeer Mustafa Inc.`
3. Enter your domain: `tauqeermustafa.tech`
4. Create your primary administrator account (e.g. `admin@tauqeermustafa.tech`).

### Step 3.2: Verify Domain Ownership via DNS (Crucial)
1. In the Google Admin Console ([admin.google.com](https://admin.google.com)), click **Verify Domain**.
2. Select **Add a TXT verification record**.
3. In your DNS provider (Cloudflare / Namecheap / Route 53):
   - **Type**: `TXT`
   - **Host / Name**: `@` (or `tauqeermustafa.tech`)
   - **Value**: `google-site-verification=xxxxxxxxxxxxxxxxxxxx`
   - **TTL**: `Auto` or `300`
4. > [!IMPORTANT]
   > **DO NOT** change your MX records to Google Workspace. Leave your MX records pointing to open.email so all your email routing continues without interruption.

### Step 3.3: Turn On Mobile Device Management
1. In [admin.google.com](https://admin.google.com), navigate to:
   **Devices → Mobile & endpoints → Settings → Universal Settings**.
2. Under **General**, set **Mobile management** to **Basic** (or **Advanced** if you wish to enforce device passwords and remote wipe of work profile).
3. Under **Android settings**:
   - Ensure **Work profile** is enabled for corporate accounts.

### Step 3.4: Provision Employee Accounts
1. In Google Admin Console, go to **Directory → Users → Add new user**.
2. Add each employee using their exact corporate email address configured in open.email (e.g. `username@tauqeermustafa.tech`).

---

## 4. How the Work Profile is Triggered for Users

### Path A: Automatic Detection in TMI Portals & Android APK
When users sign into any TMI Portal (`/employees/login`, `/admin/login`, or inside the Android App):
1. The login form automatically sets a session prompt flag.
2. `WorkProfilePrompt` displays an interactive corporate modal:
   - **On Android**: Offers a **1-Tap "Launch Work Setup"** button.
     - Inside the **TMI-Portals APK**: Calls `window.TMIAndroidBridge.triggerWorkProfileProvisioning()`, which fires Android's native `ACTION_PROVISION_MANAGED_PROFILE` or `ACTION_ADD_ACCOUNT`.
     - In mobile Chrome: Launches Android's Account Addition wizard via system deep link.
   - **On Desktop (Chrome)**: Displays the 4-step sequence to sign into Google Chrome and create the Chrome Work Profile.

### Path B: Native Android OS Sign-In
1. On any Android device, open **Settings → Passwords & Accounts → Add account → Google**.
2. Enter the employee email: `you@tauqeermustafa.tech`.
3. Enter the password.
4. Android OS automatically detects the enterprise management and displays:
   > *"Set up work profile: Your organization manages this account. A work profile will separate work apps and data from your personal apps."*
5. Tap **Accept & continue**.
6. A separate tabbed drawer labelled **Work** with the briefcase (💼) icon appears on the device with secure instances of Chrome, Gmail, and TMI Portals.

### Path C: Google Chrome Desktop Profile
1. In Google Chrome (Windows / Mac / Linux), click the **Profile avatar** in the top right.
2. Click **+ Add**.
3. Sign in with `you@tauqeermustafa.tech`.
4. Chrome immediately displays:
   > *"You are signing in with a managed account: tauqeermustafa.tech. This will create a separate Chrome profile to keep your work and personal browsing separate."*
5. Click **Create profile / Turn on sync**.
6. Chrome creates a separate desktop shortcut and profile window dedicated exclusively to company operations.

---

## 5. Technical Details of Added Code

### 1. `frontend/components/auth/WorkProfilePrompt.tsx`
- Mounted inside `PortalShell` for staff portals (`/employees`, `/admin`, `/management`).
- Detects client device (Android vs Chrome vs Desktop) and bridge presence.
- Manages persistence:
  - `localStorage.setItem("tmi_work_profile_status", "completed")` when acknowledged.
  - `sessionStorage.setItem("tmi_work_profile_dismissed", "true")` when postponed.
- Can be manually re-opened anytime by dispatching `window.dispatchEvent(new CustomEvent("tmi:open-work-profile-prompt"))`.

### 2. `frontend/components/auth/LoginForm.tsx`
- Sets `sessionStorage.setItem("tmi_just_logged_in", "true")` upon successful API sign-in so the prompt appears immediately after landing on the dashboard.

### 3. `android/app/src/main/java/tech/tauqeermustafa/app/MainActivity.java`
- Adds `TMIAndroidBridge` JavascriptInterface.
- Handles intent links:
  - `tmi://provision-work-profile`
  - `intent:#Intent;action=android.settings.ADD_ACCOUNT_SETTINGS...`
- Invokes native `android.app.action.PROVISION_MANAGED_PROFILE` and `android.provider.Settings.ACTION_ADD_ACCOUNT`.
