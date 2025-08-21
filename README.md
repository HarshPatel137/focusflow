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
- [Screenshots](#-screenshots)
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

### Optional packaging (if the repo includes a zip script)

```bash
npm run zip
# creates focusflow.zip from /dist

```

## ▶️ Usage

- Open the popup:
  - Toggle Focus Period ON to immediately block configured sites.
  - Start Pomodoro to focus for 25 minutes (customizable in settings).

- Configure blocked sites:
  - Add hostnames as chips (e.g., youtube.com, twitter.com, reddit.com).
  - Changes apply live to open tabs (no reload needed).

- When a block occurs:
  - You’ll see a full-page overlay with Go Back or Close Tab.
  - If a site doesn’t match, add its hostname variant (e.g., m.youtube.com).

## 🛠 Technical Stack

- Manifest V3 (action popup, background service worker, content script)
- TypeScript + React UI + Tailwind CSS (clean, responsive, accessible)
- Build tooling: Vite + (optionally) CRXJS for multi-entry MV3 bundling
- Chrome APIs:
  - declarativeNetRequest (hard block via dynamic rules)
  - storage (sync settings; local timers)
  - tabs, scripting (inject overlay / broadcast changes)
  - alarms (timer ticks), idle (optional)
- Message bus for Background ⇆ Content ⇆ Popup ⇆ Options updates
  
## 📷 Screenshots

Main Extension
<img width="510" height="785" alt="Screenshot 2025-08-21 170616" src="https://github.com/user-attachments/assets/0852b4b2-edc5-481b-912d-96fe0ebb774a" />

Block Popup
<img width="1919" height="989" alt="Screenshot 2025-08-21 170701" src="https://github.com/user-attachments/assets/bef0f3d3-7491-47e1-82b2-4b307bb70e7f" />

Settings
<img width="1015" height="342" alt="Screenshot 2025-08-21 170612" src="https://github.com/user-attachments/assets/e3d412c9-f8f6-4c3c-9028-534ca61071e1" />

## 🧰 Troubleshooting

**No overlay appears**
- Ensure the site matches a configured hostname (e.g., also add m.youtube.com).
- Toggle Focus OFF → ON; background will re-inject the content script.
- Reload the extension if you just updated from an older version.

**Close Tab doesn’t close**
- Chrome may restrict closing a tab not opened by the extension; we fallback to navigating away.

**Settings don’t apply**
- This build broadcasts updates instantly. If you still see stale behavior, try:
- Reopen the tab, or
- Reload the extension, then save settings once more.
  
## 🗺 Roadmap

- Per-day Schedules (allow windows)
- Grace minutes with a soft-nudge before hard block
- Usage reports (7-day) with CSV export
- Keyboard shortcut for quick focus toggle
- Import/export settings JSON

## 🤝 Contributing
PRs are welcome:
- Keep TypeScript strict & lint clean.
- Small, focused components over monoliths.
- npm run build should pass with zero TypeScript errors.

## 🪪 License
MIT — see LICENSE.



