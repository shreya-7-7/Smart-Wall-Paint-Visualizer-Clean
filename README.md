# 🎨 Smart Wall Paint Visualizer

### *Your room. Your colors. Your imagination.*

**What if you could try a new wall color before picking up a paintbrush?**

Smart Wall Paint Visualizer helps you explore wall colors on your own room photos, experiment with palettes, and preview your next room makeover—all before committing to a real-world paint choice.

<p align="center">
  <img src="https://img.shields.io/badge/INTERIOR-DESIGN-FF6B53?style=for-the-badge" alt="Interior Design" />
  <img src="https://img.shields.io/badge/CREATIVITY-UNLOCKED-7A9A82?style=for-the-badge" alt="Creativity Unlocked" />
  <img src="https://img.shields.io/badge/STATUS-IN%20DEVELOPMENT-E8B86D?style=for-the-badge" alt="In Development" />
</p>

<p align="center">
  <a href="#-the-experience">Explore Features</a> ·
  <a href="#-get-started">Get Started</a> ·
  <a href="#-the-technology">Technology</a>
</p>

---

## 🪄 The Experience

Choosing a wall color should feel exciting—not overwhelming.

Small paint swatches can look very different when applied across an entire wall. Room lighting, shadows, surrounding colors, and furniture all influence the final look.

**This is where your virtual makeover begins.**

| 🎨 Explore | 🖌️ Visualize | ✨ Transform |
|---|---|---|
| Discover colors and palettes that match your mood. | Preview paint on selected areas of your room photo. | Compare the result and save your favorite makeover. |

---

## 🌈 The Experience, Your Way

### 🖼️ 01 — Bring Your Room to Life

Upload a photo of your room and start experimenting with colors in your own space.

- Upload room images.
- Select wall regions using interactive points and corners.
- Refine wall boundaries and mark protected areas.
- Explore supported paint finishes and opacity settings.

### 🎨 02 — Find Your Signature Color

From soft neutrals to expressive accent walls, discover a palette that feels like you.

<details>
<summary><strong>🌿 A little color inspiration</strong></summary>

| Color story | Swatch | Hex |
|---|---|---|
| Warm Terracotta | 🟠 | `#FF6B53` |
| Leafy Sage | 🟢 | `#7A9A82` |
| Soft Cream | 🟡 | `#FAF8F5` |
| Deep Charcoal | ⚫ | `#1F1D1A` |
| Natural Stone | 🩶 | `#E8E2D9` |

*These are illustrative palette colors for inspiration, not a guarantee of exact on-screen or physical paint appearance.*

</details>

### ☀️ 03 — Keep the Room's Character

A good preview should preserve the room's visual character.

Experiment with wall colors while retaining the underlying room photograph, including its existing lighting and shadows as supported by the rendering implementation.

### ↔️ 04 — Before Meets After

Compare the original room with your painted preview and see how a color changes the atmosphere of your space.

### 💾 05 — Save the Look You Love

Keep your favorite makeovers close at hand.

- Save and revisit designs.
- Restore room images and design settings.
- Update or delete saved designs.
- Use backend persistence where configured.

### 🔐 06 — Built for More Than One User

The application includes authentication, protected API operations, and role-based administration for supported workflows.

---

## 🧡 Made With a Thoughtful Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React · Vite · JavaScript · CSS |
| Backend | Node.js · Express |
| Database | MongoDB · Mongoose |
| Authentication | JWT-based authentication and role checks |
| Version Control | Git · GitHub |

---

## 🚀 Get Started

Ready to give your walls a new personality?

### 1. Clone the project

```bash
git clone https://github.com/shreya-7-7/Smart-Wall-Paint-Visualizer-Clean.git
cd Smart-Wall-Paint-Visualizer-Clean
```

### 2. Install dependencies

Install frontend dependencies:

```bash
cd frontend
npm install
```

Then install backend dependencies:

```bash
cd ../backend
npm install
```

### 3. Set up your environment

Create the local `.env` files required by the application.

The frontend uses `VITE_API_URL` to identify the backend API origin. For example, if your local backend uses port `5001`:

```dotenv
VITE_API_URL=http://localhost:5001
```

Check the project's existing configuration for the exact backend environment variable names, secrets, and ports. Do not commit `.env` files or publish credentials.

### 4. Start the backend

In a terminal at the project root:

```bash
cd backend
npm run dev
```

Use the development command defined in `backend/package.json`. If `dev` is unavailable, use a script that the project actually provides.

### 5. Start the frontend

Open a second terminal at the project root:

```bash
cd frontend
npm run dev
```

Open the local URL printed by Vite, commonly `http://localhost:5173`.

**Tip:** The frontend and backend must be configured to communicate with each other, and MongoDB must be reachable for database-backed features.

---

## 🗺️ Inside the Project

```text
Smart-Wall-Paint-Visualizer-Clean/
│
├── frontend/       # The visual experience
│   └── src/        # React pages, components, and styles
│
├── backend/        # API, routes, models, and middleware
│
├── .gitignore      # Files Git should ignore
└── README.md       # You're reading it!
```

*This is a simplified overview; the full project contains additional files and folders.*

---

## 🌍 Deployment

The frontend and backend may be deployed separately.

**Frontend**
- Deploy the `frontend` directory to a compatible static hosting service.
- Set `VITE_API_URL` to the deployed backend's API origin.
- Rebuild after changing Vite environment variables.

**Backend**
- Deploy the `backend` directory to a compatible Node.js hosting service.
- Configure secrets through the hosting provider's environment settings.
- Verify MongoDB connectivity and configure CORS for the frontend domain.

Deployment is complete only after both services are available and the principal user workflows have been tested.

---

## ✅ The Makeover Checklist

Before calling a release ready, verify these experiences:

- [ ] The frontend starts and builds successfully.
- [ ] The backend starts and connects to MongoDB.
- [ ] Authentication and protected requests work.
- [ ] Unauthorized users cannot perform admin-only operations.
- [ ] Paint palettes load correctly.
- [ ] Wall selection and color previews work.
- [ ] Protected areas and before/after comparison work.
- [ ] Saved makeovers can be saved, restored, updated, and deleted.
- [ ] Image export works.
- [ ] The layout works on mobile and tablet.
- [ ] The production frontend connects to the deployed backend.

---

## 🔒 A Little Care Goes a Long Way

- Keep secrets and `.env` files out of Git.
- Use restricted database credentials and network access.
- Enforce authorization on the backend, not just in the UI.
- Review dependency vulnerabilities before production use.
- Check the licensing and attribution requirements for reused code and assets.

---

## 💌 The Philosophy

> Great design isn't just about choosing a color. It's about imagining how a space could feel—and having the confidence to try.

**Small change. Big vibe. 🎨**

*Smart Wall Paint Visualizer — bringing your color ideas to life, one wall at a time.*
