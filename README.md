# Scholars in the Making - Research Paper Quiz Platform

This project is a comprehensive, real-time quiz platform designed for the "Scholars in the Making" event, organized by the IEEE Computer Society, Pulchowk Student Branch Chapter. It features a secure admin dashboard for managing the event and a seamless quiz experience for participants.

## ✨ Features

- **Secure Admin Dashboard**: Google OAuth for admin access, restricted to a specific admin email.
- **Dynamic Question & User Management**: Easily upload quiz questions and user lists via CSV files, or add them individually through the UI.
- **Real-time Quiz Control**: Admins can start, stop, and reset the quiz for all participants simultaneously.
- **Personalized Quizzes**: Each user is assigned a unique set of questions based on their registered research paper.
- **Live Leaderboards**: Both a private admin leaderboard and a stunning public-facing leaderboard showcasing the top 5 performers, with real-time updates.
- **Email Invitations**: A dedicated page to compose and send quiz invitations (via FormSubmit.co integration).
- **Modern, Animated UI**: Built with ShadCN UI components and Framer Motion for a polished user experience.

## 🚀 Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **State Management**: Custom lightweight global store (`src/lib/quiz-store.ts`)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore for database, Firebase Authentication for admin login)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Create a `.env` file in the root of your project and populate it with your Firebase project credentials. You can find these in your Firebase project settings.

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-...

# Admin Email for Dashboard Access
NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email@example.com
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:9003](http://localhost:9003) with your browser to see the result.

The admin dashboard is available at `/admin`.

## 📁 Sample Data Files

You can find sample CSV files in the `/public` directory to use as a template for populating your quiz.

-   `/public/questions.csv`: Contains sample quiz questions.
    -   **Columns**: `id`, `text`, `option1`, `option2`, `option3`, `option4`, `correctAnswer`, `researchPaperId`
    -   The `correctAnswer` value must exactly match the text of one of the `option` columns.
-   `/public/users.csv`: Contains sample user data.
    -   **Columns**: `userId`, `userName`, `researchPaperId`
    -   `userId` should be the participant's email address.

## 📁 Project Structure

```
.
├── src
│   ├── app                 # Next.js App Router pages
│   │   ├── admin           # Admin dashboard pages
│   │   ├── public-leaderboard # Public leaderboard page
│   │   └── quiz            # Quiz and results pages
│   ├── components          # Reusable React components (UI, layout, etc.)
│   │   ├── admin           # Components specific to the admin dashboard
│   │   ├── quiz            # Components for the quiz interface
│   │   └── ui              # ShadCN UI components
│   ├── context             # React context providers (e.g., AuthContext)
│   ├── hooks               # Custom React hooks (e.g., useQuizState)
│   ├── lib                 # Core logic, types, and utilities
│   │   ├── firebase.ts     # Firebase initialization and configuration
│   │   ├── quiz-store.ts   # Global state management for the quiz
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── utils.ts        # Utility functions
│   └── public              # Static assets (images, logos, sample CSVs)
├── .env                    # Environment variables (needs to be created)
└── tailwind.config.ts      # Tailwind CSS configuration
```

This updated README should provide a great starting point for anyone working on the project.
