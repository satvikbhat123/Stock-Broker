
# 📈 Stock Dashboard

An innovative, real-time stock tracking application built to help users monitor market trends, manage stock subscriptions, and visualize portfolio performance.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Features

* **Real-Time Data:** Live tracking of stock prices and market movements.
* **User Authentication:** Secure login and signup powered by **Firebase Auth**.
* **Personalized Watchlist:** Users can subscribe/unsubscribe to specific stocks to track their favorites.
* **Modern UI:** A clean, responsive interface built with **Tailwind CSS** and **Lucide Icons**.
* **Type Safety:** Built with **TypeScript** for robust and error-free code.

## 🛠️ Tech Stack

* **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Backend / Database:** [Firebase](https://firebase.google.com/) (Firestore & Auth)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Deployment:** [Vercel](https://vercel.com/)

## ⚙️ Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository**
    ```bash
    git clone git clone https://github.com/satvikbhat123/stock_dashboard.git

    cd stock_dashboard
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory. You will need your Firebase and Stock API keys here:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key_here
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_STOCK_API_KEY=your_stock_api_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## 📂 Project Structure

```bash
stock_dashboard/
├── node_modules/       # Dependencies (Ignored by Git)
├── public/             # Static assets
├── src/
│   ├── assets/         # Images and icons
│   ├── components/     # Reusable UI components
│   ├── App.tsx         # Main application logic
│   ├── main.tsx        # Entry point
│   └── index.css       # Tailwind imports
├── .gitignore          # Files to exclude from Git
├── package.json        # Project scripts and dependencies
└── README.md           # Project documentation