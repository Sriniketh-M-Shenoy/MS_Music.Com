# Muralidhar Shenoy - Official Vocalist Website 🎵

[![Live Website](https://img.shields.io/badge/Live_Website-bit.ly%2Fmsmusicworld-amber?style=for-the-badge&logo=googlechrome&logoColor=black)](https://bit.ly/msmusicworld)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Active-emerald?style=for-the-badge&logo=github)](https://sriniketh-m-shenoy.github.io/MS_Music.Com/)

Official website and desktop visual editor app (**MS Music Studio**) for **Muralidhar Shenoy** (MS) — Classical, Light Music (Sugama Sangeetha), Devotional, and Multi-lingual Playback Vocalist & Composer.

👉 **Official Live Website**: [https://bit.ly/msmusicworld](https://bit.ly/msmusicworld)

---

## 🎨 MS Music Studio — Step-by-Step User Guide (No Coding / Technical Experience Needed!)

**MS Music Studio** is a visual Desktop Application (`MS Music Studio.app`) designed specifically for easy, non-technical website management. You do **not** need Node.js, terminal commands, code editors, or Git knowledge to use it.

---

### 📥 Step 1: Open the Application
1. Locate **`MS Music Studio.app`** in your project folder (or drag it into your Mac's `/Applications` folder).
2. **Double-click** `MS Music Studio.app` to launch the application.
3. *No Node.js or terminal setup is required* — everything launches automatically inside the standalone app!

---

### ✏️ Step 2: Edit Site Content in "Edit Mode"
When the app opens, you will be in **Edit Mode**. Use the left sidebar to select any section you wish to update:

- **Hero & Tagline**: Change artist name, title, tagline, booking button label, and upload new background photos or signature PNG images.
- **About & Biography**: Update biography paragraphs, corporate background, locations, and portrait photos.
- **Music & Audio Tracks**: Add new songs, update Spotify track URLs, titles, genres, and language filters.
- **Concerts & Events**: Manage upcoming performance dates, venues, status, and categories.
- **Photo Gallery**: Upload concert/studio photos, set captions, and assign categories (*Concerts, Studio, Festival, Devotional*).
- **Latest Posts & Social**: Highlight YouTube video covers, Instagram posts, and official channel links.
- **Testimonials & FAQs**: Manage praise from event organizers and common questions.
- **Social Links & Booking**:
  - Update email address and social media channel URLs.
  - **Enable / Disable Google Booking Form**: Toggle embedded Google Booking Form on or off.
  - **Enable / Disable Direct Email Form**: Toggle direct email booking enquiry form on or off.
- **Reorder & Hide Sections**: Click up/down arrows to change the order of sections on your website, or toggle checkboxes to temporarily hide any section.

---

### 👁️ Step 3: Save Draft & Preview Changes
- **Save Draft**: Click the **Save Draft** button in the top header to save your work locally.
- **Full Site Preview**: Click the **Full Site Preview** button at the top. The application will render a full live preview of your website with your latest edits.
- **Return to Edit Mode**: In preview mode, simply hover over the **center-left floating arrow tab (`← Back to Edit Mode`)** and click it to return to editing.

---

### 🚀 Step 4: Publish Live to GitHub Pages
When you are ready to publish your updates to the live website (`bit.ly/msmusicworld`):
1. Click the golden **Publish to Website** button in the top right.
2. Enter an optional note (e.g., *"Updated upcoming concert dates for Mangaluru"*).
3. Click **Confirm & Publish Live**.
4. The app will automatically save your files, commit changes, push to GitHub, and deploy your live website. Your changes will be live on the internet within 1–2 minutes!

---

### 📜 Step 5: Version History & 1-Click Restores
- Click **Version History & Revert** in the left sidebar to view a complete timeline of previously published website updates with timestamps.
- Click **Restore This Version** next to any past update to roll back your live website to that exact snapshot.
- If a merge conflict ever occurs, friendly visual choice cards (*"Which version do you want to keep?"*) will guide you to select your preferred version visually.

---

## 🛠️ Developer & Technical Setup Guide

For developers maintaining or extending the codebase:

### Prerequisites
- Node.js (v18+) & npm

### Development Workflow
```bash
# 1. Install dependencies
npm install

# 2. Run Vite web dev server (port 5173)
npm run dev

# 3. Run Studio backend API server (port 3001)
npm run studio:server

# 4. Run Electron desktop studio in development mode
npm run electron:dev
```

### Production Build & App Packaging
```bash
# Build Vite production assets (dist/)
npm run build

# Package macOS Standalone Bundle (release/mac-arm64/MS Music Studio.app)
npm run build:mac
```

---

## 🌐 Live Website Links
- **Short URL**: [https://bit.ly/msmusicworld](https://bit.ly/msmusicworld)
- **GitHub Pages URL**: [https://sriniketh-m-shenoy.github.io/MS_Music.Com/](https://sriniketh-m-shenoy.github.io/MS_Music.Com/)
