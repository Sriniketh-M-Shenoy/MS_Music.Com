# Muralidhar G. Shenoy - Official Vocalist Website 🎵

A modern, elegant, multi-lingual portfolio and performance booking website for **Muralidhar G. Shenoy** — Classical, Light Music (Sugama Sangeetha), and Film Song Vocalist.

Built with **React**, **Vite**, **Tailwind CSS**, and **Lucide Icons**, optimized for fast loading and deployment to **GitHub Pages**.

---

## 🌟 Key Features

1. **Central Configuration File (`src/config/siteConfig.js`)**:
   - All website text, singer bio, social media links, Google Form URLs, audio samples, YouTube videos, event schedules, photo gallery, testimonials, and FAQs are driven by a single file.
   - Edit content without touching any React code!

2. **Google Form Integration (`#enquire`)**:
   - Embedded Google Form for event booking requests.
   - Direct button to open Google Form in a new tab.
   - Quick fallback to instant WhatsApp or Email enquiries.

3. **Audio & Video Showcase**:
   - Interactive custom audio preview player with language filters (*Kannada, Hindi, Konkani, Classical*).
   - Filterable YouTube video grid showcasing live concert recordings.

4. **Concert & Event Schedule**:
   - Highlight upcoming and past concerts with date badges, venues, times, and RSVP links.

5. **Photo Gallery & Lightbox**:
   - Filterable gallery (*Concerts, Studio, Festival, Devotional*) with full-screen lightbox modal viewer.

6. **Responsive Royal Design**:
   - Crafted with a gold and deep velvet aesthetic suitable for classical and playback vocal performances.

---

## ⚙️ How to Customize Site Content (`siteConfig.js`)

Open `src/config/siteConfig.js` in your editor to update any details:

### 1. Social Media Links
```javascript
socials: {
  instagram: "https://www.instagram.com/muralidhargshenoy/?hl=en",
  facebook: "https://www.facebook.com/muralidhar.g.shenoy/",
  youtube: "https://www.youtube.com/channel/UCZZkLUPMv1Ka4bNSyOpYGOA",
  whatsapp: "https://wa.me/919876543210...",
  email: "booking.muralidharshenoy@gmail.com",
}
```

### 2. Google Form Embed URL
To embed your custom Google Form:
1. Open your Google Form -> Click **Send**.
2. Go to the **`< >` (Embed HTML)** tab and copy the `src` link.
3. Paste the link into `googleForm.embedUrl` in `src/config/siteConfig.js`.

---

## 🚀 Hosting on GitHub Pages

This project is pre-configured for GitHub Pages deployment.

### Step 1: Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit of Muralidhar Shenoy Music Website"
```

### Step 2: Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/MS_Music_Website.git
git push -u origin main
```

### Step 3: Deploy to GitHub Pages
Run the built-in deploy command:
```bash
npm run deploy
```
This automatically builds your site (`npm run build`) and publishes the static files to the `gh-pages` branch on GitHub!

---

## 💻 Local Development

Run local development server:
```bash
npm run dev
```

Build production bundle:
```bash
npm run build
```
