# EdgeNotes 📌

> A lightweight, modern desktop edge-snapping and auto-hiding notes & to-do widget built with **Electron**, **React**, and **Vite**.  
> **Developed by GeoNovex**

EdgeNotes docks seamlessly to your screen edge (Right, Left, or Top), collapsing into a subtle edge sliver when idle and expanding smoothly when you interact with it.

---

## ✨ Features

- **Dock to Screen Edge**: Attach to Right, Left, or Top edge of your screen.
- **Auto-Hide / Collapse**: Minimizes into a thin edge bar to stay out of your way while working.
- **Always on Top & Transparent**: Stays floating above other windows without window chrome / borders.
- **Quick Notes & To-Do List**:
  - Keep running notes with autosave.
  - Interactive task checklist with completion toggles.
- **Dark Glassmorphic UI**: Sleek, modern interface styled with glowing accents and smooth animations.
- **Auto-Launch**: Optional launch on system startup.

---

## 🛠️ Tech Stack

- **Runtime**: [Electron](https://www.electronjs.org/)
- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Packaging**: [electron-builder](https://www.electron.build/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn` / `pnpm`

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/<your-username>/edge-notes.git
   cd edge-notes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 💻 Development

Run both the Vite dev server and the Electron application concurrently:

```bash
npm run dev
```

Or run them individually:
```bash
# Terminal 1: Vite dev server
npm run dev:vite

# Terminal 2: Electron runner
npm run dev:electron
```

---

## 📦 Building for Production

To compile the React frontend and bundle desktop installers:

- **Windows Installer (NSIS)**:
  ```bash
  npm run dist:win
  ```
- **Linux Package (AppImage / deb)**:
  ```bash
  npm run dist:linux
  ```

Output binaries will be located in the `dist-electron/` folder.

---

## 👨‍💻 Developed By

Developed with ❤️ by **[GeoNovex](https://geonovex.netlify.app)**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

