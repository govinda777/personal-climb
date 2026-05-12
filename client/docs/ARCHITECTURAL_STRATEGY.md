# Architectural Strategy: Actor-Based Route Structuring

This document outlines the organization of the `src/app` directory using Next.js **Route Groups**. This structure is designed to provide unique, clear, and scalable experiences for each participant (actor) in the Personal Climb ecosystem.

## 1. Actor Definitions & Experience Strategy

| Actor | Target Audience | Primary Goal | UI/UX Strategy |
| :--- | :--- | :--- | :--- |
| **Business** | Coaches/Gyms | Sales & Conversion | Premium, marketing-heavy, dark/gold accents. |
| **Professor** | Trainers | Management & Productivity | Dashboard style, data-dense, sidebar navigation. |
| **Athlete** | Students | Execution & Consistency | Mobile-first, high contrast, "Focus Mode" for training. |
| **Public** | Prospects | Branding & Onboarding | Clean, trustworthy, reflects the Personal's brand. |

## 2. Directory Structure

The application is divided into route groups (folders prefixed with parentheses) which do not affect the URL path but allow for dedicated layouts and middleware logic.

```text
src/app/
├── (auth)/                 # Authentication flow (Login, Register, Onboarding)
│   ├── login/
│   └── layout.tsx
├── (marketing)/            # Public platform site
│   ├── business/           # /business (Landing for coaches)
│   ├── page.tsx            # / (Root landing)
│   └── layout.tsx          # Marketing layout (Top-nav, Footer)
├── (profile)/              # Public profile pages
│   └── p/[slug]/           # /p/govinda (Shortened from /personal/[slug])
│       └── page.tsx
├── (athlete)/              # Student protected area
│   ├── athlete/
│   │   ├── training/       # /athlete/training
│   │   └── history/        # /athlete/history
│   └── layout.tsx          # Athlete layout (Bottom-nav, Mobile-optimized)
└── (professor)/            # Trainer protected area
    ├── professor/
    │   ├── dashboard/      # /professor/dashboard
    │   └── students/       # /professor/students
    └── layout.tsx          # Professor layout (Sidebar-nav, Desktop-optimized)
```

## 3. Key Benefits

- **Separation of Concerns**: Each actor has its own layout and design tokens without overlapping logic.
- **Improved UX**: Athletes get a mobile-first "Focus Mode", while Professors get a desktop-optimized data dashboard.
- **Clean URLs**: Public profiles are shortened to `/p/[slug]` for a more professional feel.
- **Scalability**: Adding new features for specific roles is as simple as adding routes within the corresponding group.

## 4. Implementation Details

### Profile Routes
The profile route was shortened from `/personal/[slug]` to `/p/[slug]`. Internal links should be updated to reflect this change.

### Layouts
Each route group contains its own `layout.tsx` to handle specific navigation patterns (e.g., bottom bar for athletes, sidebar for professors).
