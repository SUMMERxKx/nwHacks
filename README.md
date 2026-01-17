# Wellness Buddy - Self-Awareness & Reflection App

A comprehensive wellness tracking and self-reflection application built with React and TypeScript. This app helps users build self-awareness through daily check-ins, AI-powered insights, pattern recognition, and weekly reviews.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Application Structure](#application-structure)
- [Core Features](#core-features)
- [Data Models](#data-models)
- [Page-by-Page Functionality](#page-by-page-functionality)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Future Integrations](#future-integrations)

## Overview

Wellness Buddy is a personal wellness tracking application that enables users to:
- Record daily check-ins with ratings and reflective prompts
- Interact with an AI "Buddy" that learns from their check-ins
- Discover patterns in their behavior, mood, and productivity
- Track wins and celebrate achievements
- Generate weekly reviews with insights and recommendations

The app is designed as a mobile-first, single-page application with a tab-based navigation system.

## Technology Stack

### Core Framework
- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### Routing & State
- **React Router DOM 6.30** - Client-side routing
- **TanStack React Query 5.83** - Server state management (prepared for API integration)

### UI Framework
- **shadcn/ui** - Component library built on Radix UI primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Key Libraries
- **React Hook Form 7.61** + **Zod 3.25** - Form handling and validation
- **date-fns 3.6.0** - Date manipulation
- **Recharts 2.15** - Data visualization (available but not yet used)

## Application Structure

```
src/
├── pages/              # Main page components
│   ├── CheckIn.tsx    # Daily check-in interface
│   ├── Buddy.tsx      # AI chat interface
│   ├── Patterns.tsx   # Pattern insights
│   ├── Wins.tsx       # Achievements and growth
│   ├── Weekly.tsx     # Weekly review
│   └── NotFound.tsx   # 404 page
├── components/
│   ├── layout/        # Layout components
│   │   ├── AppLayout.tsx      # Main app wrapper
│   │   └── TabNavigation.tsx  # Bottom tab bar
│   ├── ui/            # Reusable UI components (shadcn/ui)
│   └── settings/      # Settings modal
├── lib/
│   ├── mockData.ts    # Mock data structures and helpers
│   └── utils.ts       # Utility functions
└── App.tsx            # Root component with routing
```

## Core Features

### 1. Daily Check-In System
Users can record daily reflections including:
- **Four Rating Scales** (1-10): Stress, Energy, Mood, Focus
- **Five Reflective Prompts**:
  - What are you proud of today?
  - Did you feel stressed? Why?
  - What was the biggest challenge?
  - One thing you're grateful for
  - One intention for tomorrow

### 2. AI Buddy Chat Interface
An AI assistant that:
- Learns from user's check-in history
- Provides personalized insights
- Suggests strategies based on patterns
- Has configurable context window (7 or 30 days)

### 3. Pattern Recognition
Identifies patterns in user behavior such as:
- Productivity correlations (e.g., morning routines → higher focus)
- Stress triggers (e.g., meeting overload → lower energy)
- Energy restoration activities
- Each pattern includes evidence, meaning, and suggested experiments

### 4. Wins & Achievements
Tracks and celebrates:
- User accomplishments extracted from check-ins
- Growth notes highlighting positive changes
- Consistency metrics (check-in streaks)

### 5. Weekly Review
Generates comprehensive weekly summaries with:
- Theme/title for the week
- What went well / what didn't go well
- Focus areas for next week
- Risk flags to watch
- Ability to create next week's plan

## Data Models

### CheckInEntry
```typescript
{
  id: string
  date: string (ISO date)
  ratings: {
    stress: number (1-10)
    energy: number (1-10)
    mood: number (1-10)
    focus: number (1-10)
  }
  prompts: {
    proud: string
    stressed: string
    challenge: string
    grateful: string
    intention: string
  }
  createdAt: string (ISO timestamp)
  updatedAt: string (ISO timestamp)
}
```

### ChatMessage
```typescript
{
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string (ISO timestamp)
}
```

### PatternInsight
```typescript
{
  id: string
  title: string
  meaning: string
  evidence: string[]
  experiment: string
  confidence: 'Low' | 'Medium' | 'High'
}
```

### Win
```typescript
{
  id: string
  title: string
  evidence: string
  date: string (ISO date)
}
```

### WeeklyReview
```typescript
{
  id: string
  weekStart: string (ISO date)
  weekEnd: string (ISO date)
  theme: string
  wentWell: string[]
  didntGoWell: string[]
  nextWeekFocus: string[]
  riskFlags: string[]
}
```

### MemorySnapshot
```typescript
{
  commonStressors: string[]
  restoresEnergy: string[]
  peakProductivity: string
  recentWins: string[]
}
```

## Page-by-Page Functionality

### Check-In Page (`/`)
**Purpose**: Primary entry point for daily reflections

**Key Features**:
- Date navigation (previous/next days, can't navigate to future)
- Streak counter display (consecutive days with check-ins)
- Empty state when no check-in exists for a day
- Four rating sliders with descriptive labels and helper text
- Five text areas for reflective prompts
- Save functionality (currently logs to console, TODO: Firebase)
- Unsaved changes warning
- Success banner after saving

**State Management**:
- Local state for all ratings and prompts
- Loads existing entry when navigating to a date with data
- Tracks unsaved changes separately from saved state

**User Flow**:
1. User sees empty state or existing check-in for selected date
2. Adjusts ratings (sliders)
3. Fills in prompts (text areas)
4. Clicks Save when ready
5. See success confirmation

### Buddy Page (`/buddy`)
**Purpose**: Conversational AI interface for personalized insights

**Key Features**:
- Chat interface with message bubbles (user right-aligned, assistant left-aligned)
- Memory Snapshot section (collapsible) showing:
  - Common stressors
  - Energy restoration activities
  - Peak productivity times
- Context window selector (7 or 30 days via bottom sheet)
- Quick prompt buttons when chat is empty
- Typing indicator while AI "thinks"
- Auto-scroll to latest message
- Input field with Enter-to-send

**Current Implementation**:
- Uses mock chat messages
- Simulated AI response (1.5s delay)
- TODO: Replace with actual OpenAI Cloud Function integration

**User Flow**:
1. View Memory Snapshot summary (collapsed by default)
2. Type message or use quick prompt
3. See AI response with personalized insights
4. Continue conversation about patterns, strategies, etc.

### Patterns Page (`/patterns`)
**Purpose**: Display AI-generated insights about user behavior patterns

**Key Features**:
- Time period filter (7 or 30 days)
- Empty state if < 3 check-ins completed
- Generate button to trigger pattern analysis
- Pattern cards showing:
  - Title and confidence level chip
  - Meaning explanation
  - Evidence quotes from check-ins
  - Suggested experiment to test the pattern
- Loading state with skeleton cards during generation

**Current Implementation**:
- Uses mock pattern data
- TODO: Replace with actual pattern generation Cloud Function

**User Flow**:
1. Select time period (7 or 30 days)
2. Click "Generate" if enough data exists
3. View pattern insights with evidence
4. Read suggested experiments to validate patterns

### Wins Page (`/wins`)
**Purpose**: Celebrate achievements and track growth

**Key Features**:
- Time period filter (This week / Last 30 days)
- Consistency widget showing:
  - Check-ins this week (X/7 days)
  - Progress bar visualization
- Top Wins section with cards showing:
  - Win title
  - Evidence/description
- Growth Notes section with positive observations
- Generate button to refresh wins
- Loading state with skeletons

**Current Implementation**:
- Uses mock wins and growth notes
- TODO: Replace with actual wins generation Cloud Function

**User Flow**:
1. Select time period
2. View consistency progress
3. Scroll through wins and growth notes
4. Optionally regenerate to see updated wins

### Weekly Page (`/weekly`)
**Purpose**: Comprehensive weekly summary and planning

**Key Features**:
- Week navigation (previous weeks, current week)
- Week date range display
- Theme card (large quote-style display)
- Two-column layout: "Went Well" vs "Didn't Go Well"
- Next Week Focus section
- Risk Flags section (warning styling if present)
- "Create Next Week Plan" button opening modal
- Empty state if no check-ins exist
- Generate button to create review

**Current Implementation**:
- Uses mock weekly review data
- TODO: Replace with actual weekly review generation Cloud Function
- TODO: Save next week plan to Firebase

**User Flow**:
1. Navigate to desired week
2. Generate weekly review (or view existing)
3. Read theme, highlights, and focus areas
4. Review risk flags
5. Optionally create plan for next week via modal

## Component Architecture

### Layout Components

#### AppLayout
- Wraps all pages
- Provides max-width container (mobile-first, max-w-lg)
- Includes bottom padding for tab navigation
- Renders TabNavigation at bottom

#### TabNavigation
- Fixed bottom navigation bar
- Five tabs: Check-In, Buddy, Patterns, Wins, Weekly
- Active state highlighting
- Uses React Router NavLink for navigation

### Reusable UI Components

The app uses shadcn/ui components extensively:
- **RatingSlider**: Custom slider for 1-10 ratings with labels
- **TextAreaWithCounter**: Text area with character counter
- **Chip**: Small badge component (primary, muted, success, warning variants)
- **ConfidenceChip**: Specialized chip for pattern confidence levels
- **PageHeader**: Consistent header with title, subtitle, action, and settings
- **EmptyState**: Centered empty state with icon, title, description, optional action
- **InlineBanner**: Temporary banner notifications (success, info, warning)
- **SkeletonLoader**: Loading state placeholders

### Settings
- **SettingsModal**: Accessible from all pages via header
- Currently placeholder for future settings

## State Management

### Local State (React useState)
- All pages use local state for their UI state
- Check-In page: ratings, prompts, date navigation
- Buddy page: messages, input value, typing state
- Patterns/Wins/Weekly: period filters, generation state

### Data State
- Currently uses mock data from `mockData.ts`
- Data is imported directly, not managed in global state
- All "saves" currently log to console
- Ready for integration with React Query when backend is added

### React Query Setup
- QueryClient configured in App.tsx
- Prepared for async data fetching but not yet used
- Will handle caching, refetching when Firebase is integrated

## Navigation & Routing

**Routes**:
- `/` - Check-In (default)
- `/buddy` - AI Buddy chat
- `/patterns` - Pattern insights
- `/wins` - Wins & achievements
- `/weekly` - Weekly review
- `*` - 404 Not Found page

**Navigation**:
- Bottom tab bar for primary navigation
- Programmatic navigation via React Router (date changes in Check-In)
- Browser back/forward supported

## Styling Approach

### Tailwind CSS
- Utility-first CSS
- Custom color scheme via Tailwind config
- Mobile-first responsive design
- Custom animations: `fade-in`, `slide-up`, `pulse-gentle`

### Design System
- **Cards**: `card-elevated`, `card-soft` classes for consistent card styling
- **Colors**: Primary, muted, success, warning variants
- **Spacing**: Consistent spacing scale (gap-2, gap-4, p-4, p-5, etc.)
- **Typography**: Serif font for themes/quotes, sans-serif for UI

## Helper Functions

### Date Utilities (`mockData.ts`)
- `formatDate()`: "Mon, Jan 15" format
- `formatDateFull()`: "Monday, January 15, 2024" format
- `getWeekStart()`: Calculates Monday of week
- `getWeekEnd()`: Calculates Sunday of week
- `getStreakCount()`: Calculates consecutive check-in days

## Future Integrations (TODOs)

### Backend Integration
1. **Firebase Firestore**:
   - Replace mock data with Firestore collections
   - Implement CRUD operations for check-ins
   - Store user settings and preferences

2. **Cloud Functions** (likely Firebase Functions):
   - **Pattern Generation**: Analyze check-ins to generate pattern insights
   - **Wins Extraction**: Identify and extract wins from check-ins
   - **Weekly Review Generation**: Aggregate week data into review
   - **AI Buddy Responses**: OpenAI integration for chat responses
   - **Memory Snapshot Updates**: Update user memory from check-ins

### Features
- User authentication (Firebase Auth)
- Multi-user support
- Data export functionality
- Reminders/notifications for daily check-ins
- Data visualization charts (Recharts integration)
- Customizable prompts
- Privacy settings

## Development

### Running the App
```bash
npm install
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
npm test           # Run tests
npm run lint       # Lint code
```

### Key Scripts
- `dev`: Vite dev server with hot reload
- `build`: Production build output to `dist/`
- `build:dev`: Development build
- `preview`: Preview production build locally
- `test`: Run Vitest tests
- `test:watch`: Watch mode for tests

## Design Principles

1. **Mobile-First**: Optimized for mobile devices with bottom tab navigation
2. **Progressive Disclosure**: Information revealed as needed (collapsible sections, modals)
3. **Feedback**: Clear feedback for all actions (banners, loading states, confirmations)
4. **Empty States**: Helpful guidance when no data exists
5. **Consistency**: Unified design language across all pages
6. **Accessibility**: Using Radix UI primitives ensures keyboard navigation and screen reader support

## Notes for AI Integration

This app is designed to integrate with AI services for:
- **Pattern Analysis**: Analyzing check-in data to identify behavioral patterns
- **Natural Language Generation**: Creating personalized insights and recommendations
- **Conversational AI**: Powering the Buddy chat interface with context awareness
- **Summary Generation**: Creating weekly reviews and win extractions from user data

The current architecture separates concerns clearly:
- **Frontend** handles UI, user input, and state management
- **Backend** (to be implemented) will handle data processing, AI calls, and persistence
- **Mock data** provides structure for expected data formats and can serve as examples for AI training
