# FocusFlow
## Distraction Blocker for Deep Work (MV3)

FocusFlow helps you lock in: block distracting sites, start a **Focus Period** or a **Pomodoro**, and get a clean, accessible overlay that nudges you back on task with **live updates** (no manual refresh).

> ✅ Chrome • Edge • Brave (Manifest V3)  
> 🛡️ Privacy-first: stores only hostnames & timers (no page content)

---

## 🎬 Demo

https://github.com/user-attachments/assets/cb9b52f2-5c60-446b-b847-52624212643d  

*Watch how FocusFlow keeps you in flow by blocking time-wasters while you’re focusing.*

---

## ✨ Features

- **Focus Modes**
  - **Focus Period** — instantly blocks your configured sites.
  - **Pomodoro** — 25:00 focus timer with subtle animations & quick actions.
- **Premium Overlay**
  - Glass/blur overlay with **Go Back** / **Close Tab** / **Open Settings** actions.
  - Keyboard accessible (focus trap; ESC behavior defined).
- **Live Updates (No Refresh)**
  - Background service worker broadcasts state; content script updates immediately.
- **Clean Settings**
  - Centered, wider layout; chips UI for blocked hostnames; clear helper text.
- **Privacy**
  - Stores **only hostnames** and **time totals** in `chrome.storage`.
  - No external servers; everything runs locally in your browser.

---

## 🧭 Table of Contents

- [Install (no dev tools)](#-install-no-dev-tools)
- [Developer Setup](#-developer-setup)
- [Usage](#-usage)
- [Technical Stack](#-technical-stack)
- [Architecture](#-architecture)
- [Permissions & Privacy](#-permissions--privacy)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📦 Install (no dev tools)

1. Download the latest ZIP from **Releases** and extract it.  
2. Open **`chrome://extensions`** (or **`edge://extensions`** / **`brave://extensions`**).  
3. Toggle **Developer mode**.  
4. Click **Load unpacked** and select the extracted folder (or `dist/` if provided).  
5. Pin **FocusFlow** to your toolbar.

> Brave users: same steps via **`brave://extensions`**.

---

## 🧑‍💻 Developer Setup

> Requires **Node 18+** (or 20+).

```bash
# 1) Install dependencies
npm install

# 2) Dev build with watching (varies per setup)
npm run dev

# 3) Production build
npm run build

# 4) Load the built extension:
#    Load the "dist/" folder as unpacked in chrome://extensions
