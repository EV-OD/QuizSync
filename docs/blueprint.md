# **App Name**: QuizSync

## Core Features:

- CSV Upload: Admin dashboard for uploading questions and user assignments via CSV files.
- URL Generation: Generate personalized quiz URLs for each user based on uploaded data.
- Quiz Activation: Admin control panel to start the quiz for all users simultaneously.
- Timed Quiz: Timed quiz execution with automatic question advancement and clear progress indicator.
- Results Display: Display quiz results immediately after completion, showing the score and completed status.
- Anti-Cheat: Implement measures to prevent cheating disabling right-click.
- Next.js Architecture: Implement a modular and scalable architecture using Next.js best practices, including page-based routing, modular components, and separation of concerns between UI, logic, and data layers. Utilize React patterns such as custom hooks for state management, server-side props (getStaticProps or getServerSideProps) for data fetching, and reusable UI components within the `components/` directory. Enforce code quality through ESLint and Prettier, follow consistent naming conventions (e.g., kebab-case for files, PascalCase for components), and maintain well-documented functions and components. Leverage Next.js App Router or Pages Router structure cleanly to ensure maintainability and scalability.

## Style Guidelines:

- Primary: Dark Blue #003875 (used for headers, navigation, and key UI elements)
- Secondary: Light Blue #0079C1 (used for accents and progress indicators)
- Accent: Vibrant Yellow #FFD60A (used for calls to action, buttons, and highlights)
- Background: Light Gray #F5F5F5 or White for content areas to ensure readability
- Headline font: 'Space Grotesk' (sans-serif) for a modern, technical feel.
- Body font: 'Inter' (sans-serif) to provide a neutral, clean reading experience. Recommended pairing with Space Grotesk.
- Simple, geometric icons to represent different quiz sections and actions.
- Clean and minimal design with clear sections for questions, timer, and results.