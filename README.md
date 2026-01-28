# Nightcap - Cocktail Recipe Manager

A mobile-first cocktail recipe manager built with React, Supabase, and Capacitor. Track your bar inventory, discover cocktails you can make, and log your cocktail-making experiences.

## Features

- Browse and search cocktail recipes
- Track your bar inventory
- Discover cocktails you can make with your ingredients
- Log your cocktail-making experiences
- Mobile apps for iOS and Android

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Supabase (Backend & Auth)
- Capacitor (Mobile)
- Vite (Build Tool)

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/nightcap.git
cd nightcap
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file with your Supabase credentials
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

### Building Mobile Apps

#### iOS
```bash
npm run ios:build
npm run ios:open
```

#### Android
```bash
npm run android:build
npm run android:open
```

## License

MIT