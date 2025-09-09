# ✨ Zenith List

**Zenith List** is a modern, feature-rich to-do list and habit tracker application designed to boost productivity through gamification and detailed progress visualization. Built with React and Firebase, this full-stack app provides a seamless and engaging user experience.

---

### 🚀 Live Demo

**[View the live application here!](https://zenith-list-app.vercel.app)**


---


### ✨ Features

-   **Full User Authentication:** Secure sign-up, login, and logout functionality using Firebase Authentication.
-   **Comprehensive Task Management:** Create, edit, and delete tasks with full CRUD capabilities.
-   **Dual Task System:**
    -   **🎯 One-Time Tasks:** Standard to-do items with optional due dates.
    -   **📅 Daily Habits:** Recurring tasks designed for building routines.
-   **Gamification Engine:**
    -   **⚡ Zenith Score:** A daily productivity score that resets at midnight.
    -   **🔥 Streaks:** Track and maintain your consistency with daily habits.
    -   **🏆 Achievements:** Unlock badges for reaching important milestones.
-   **Advanced Filtering & Searching:**
    -   Filter tasks by status (All, Active, Completed).
    -   Sort tasks by creation date or due date.
    -   Instant search across all tasks.
-   **In-Depth Progress Visualization:**
    -   **Completions Chart:** An interactive bar chart to view task completions by week, month, or year with a date picker.
    -   **Habit Tracker:** A checkmark-style grid to visualize daily habit consistency with weekly and monthly views.
-   **Calendar View:** A full-page calendar that displays all one-time tasks based on their due dates.
-   **Modern UI/UX:**
    -   **Light & Dark Mode:** A toggle to switch between themes.
    -   **Professional Icons:** Uses Bootstrap Icons for a clean, consistent look.
    -   **Responsive Design:** A polished and usable experience on both desktop and mobile devices.

---

### 🛠️ Tech Stack

-   **Frontend:** React, Vite, React Router
-   **Backend & Database:** Firebase (Firestore, Authentication)
-   **Styling:** CSS with variables for theming
-   **Libraries:**
    -   FullCalendar (Calendar View)
    -   Chart.js (Completions Report Chart)
    -   `react-datepicker`
    -   `react-hot-toast` (Notifications)
    -   `canvas-confetti`
    -   Bootstrap Icons

---

### 📦 Getting Started

To run this project locally, follow the steps below.

#### Prerequisites

-   Node.js (v18 or later)
-   A Firebase project with Firestore and Authentication enabled.

#### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Kajalmehta29/zenith-list-app.git](https://github.com/Kajalmehta29/zenith-list-app.git)
    cd zenith-list-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Create a file named `.env.local` in the root of the project.
    -   Copy your Firebase project configuration into it, making sure to add the `VITE_` prefix to each key:
    ```
    VITE_FIREBASE_API_KEY="AIzaSy..."
    VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
    VITE_FIREBASE_PROJECT_ID="your-project"
    VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
    VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
    VITE_FIREBASE_APP_ID="1:123456789:web:abcdef123456"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:5173`.

---

### 🚀 Deployment

This application is deployed on **Vercel**. The production branch is `main`. Any pushes to this branch will trigger an automatic redeployment.

---

