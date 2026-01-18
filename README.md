# CodeGenius

CodeGenius is an AI-powered learning platform designed to help aspiring developers master programming faster. By combining personalized learning paths with interactive AI tools, CodeGenius offers a unique, tailored educational experience.

Built with **Next.js 15**, **Firebase**, and **Google Genkit** (Gemini models).

## 🚀 Features

-   **AI-Powered Learning Paths**: Analyzes your current skill level and interests to generate a custom curriculum with estimated timelines and curated resources.
-   **AI Code Generator**: Describe what you want to build in plain English, and the AI will generate the code for you in languages like JavaScript, Python, TypeScript, and more.
-   **Interactive Dashboard**: A personalized space to track your progress and access tools.
-   **Secure Authentication**: Fully integrated Firebase Authentication for secure login and signup.
-   **Modern UI**: Beautiful, responsive interface built with Tailwind CSS and Shadcn UI.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **AI & LLM**: [Genkit](https://firebase.google.com/docs/genkit) with Google Gemini (`gemini-2.5-flash`)
-   **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Authentication, App Hosting)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   A Firebase project
-   A Google AI Studio API Key (for Gemini)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/alamnahin/codegenius.git](https://github.com/alamnahin/codegenius.git)
    cd codegenius
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and add your keys (refer to `src/firebase/config.ts` and Genkit docs for exact variable names, typically):
    ```env
    GOOGLE_GENAI_API_KEY=your_gemini_api_key
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

### Running the App

1.  **Start the Next.js development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:9002`.

2.  **Start Genkit Developer UI (Optional):**
    If you want to test and debug your AI flows:
    ```bash
    npm run genkit:dev
    ```

## 📂 Project Structure

-   `src/ai`: Contains Genkit AI flow definitions (e.g., code generation, learning path creation).
-   `src/app`: Next.js App Router pages and layouts.
-   `src/components`: Reusable UI components (buttons, cards, forms).
-   `src/firebase`: Firebase configuration and hooks.
-   `src/hooks`: Custom React hooks (e.g., `use-toast`, `use-mobile`).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.