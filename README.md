# MyNatureJourney 🌿

A Next.js application for documenting and sharing nature travel experiences.

## Design Concept

**Style:** Nature Minimal / Modern / Clean

**Color Palette:**
- Nature Green: `#4CAF50`
- Sky Blue: `#4FC3F7`
- Light Brown: `#A1887F`
- White: `#FFFFFF`

**Fonts:** Prompt (Thai support) / Inter

## Features

### UX Flow
1. **Landing Page** - Welcome visitors with a clean, nature-inspired design
2. **Login/Signup** - Google & Apple authentication options
3. **Dashboard** - Interactive map with recent trips overview
4. **Create Memory** - Add new trips with photos and stories
5. **Privacy Options** - Share with friends or keep trips private

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
app/
├── page.tsx                    # Landing page
├── login/                      # Authentication
│   └── page.tsx
├── signup/                     # Registration
│   └── page.tsx
├── dashboard/                  # Main dashboard
│   ├── page.tsx
│   └── create-memory/          # Trip creation flow
│       └── page.tsx
├── layout.tsx                  # Root layout with fonts
└── globals.css                 # Global styles with brand colors
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Fonts:** Google Fonts (Prompt, Inter)

## Available Pages

- `/` - Landing page
- `/login` - Login page
- `/signup` - Registration page
- `/dashboard` - User dashboard with map and recent trips
- `/dashboard/create-memory` - Create new trip memory

## Development

The application uses:
- Server Components by default
- Client Components (marked with `'use client'`) for interactive features
- Tailwind CSS custom theme configuration
- Thai language support

---

Built with ❤️ for nature lovers
