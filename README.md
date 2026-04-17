<h1 align="center">
  <br>
  💼 Jobserv (Smart Job Tracker)
  <br>
</h1>

<h4 align="center">A modern, AI-powered platform to organize, track, and optimize your job applications.</h4>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Environment Variables</a>
</p>

## ✨ Introduction

**Jobserv** is a production-grade job application tracking system built with the MERN stack. Designed to take the chaos out of the job hunt, it features secure OAuth authentication, an interactive real-time dashboard, and an integrated **Gemini AI Resume Analyzer** that gives you instant feedback and tailored cover letters to help you land your dream job faster.

## 🚀 Key Features

* **Real-time Job Dashboard**: Track the status of your applications (Applied, Interviewing, Offered, Rejected) with an interactive, Tailwind-powered UI.
* **AI Resume Analysis**: Upload your PDF resumes and let Google's Gemini AI analyze them, rate applications, and generate optimized cover letters.
* **Secure Authentication**: Frictionless login via Google and LinkedIn OAuth. Core application logic is protected with robust JWT-based session management.
* **Multi-Format Uploads**: Built-in file-parsing backend configured to securely handle and sanitize PDF resume content.
* **Modern & Responsive UI**: Beautiful glassmorphic designs, toast notifications, and modern typography designed perfectly for all screen sizes.
* **Security Hardened**: Built-in protections including request rate-limiting, Helmet security headers, password hashing, and thoroughly sanitized API endpoints.

## 🛠️ Tech Stack

**Frontend**
* React.js (v19)
* Tailwind CSS
* React Router & React Icons
* Axios & React Hot Toast

**Backend**
* Node.js & Express.js
* MongoDB & Mongoose
* Google Gemini AI API (`@google/generative-ai`)
* Passport.js (Google & LinkedIn OAuth)
* JWT Authentication
* Multer & PDF-Parse

## 🏁 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) and Git installed on your machine. You will also need a MongoDB database and keys for Google OAuth and the Gemini API.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/jobserv.git
   cd jobserv
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## 🔐 Environment Variables

You need to configure your environment variables for both the backend and frontend. Copy your `.env.example` configuration into local `.env` files.

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | The port the backend will run on (e.g., `5000`) |
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | A secure, random string for JWT token generation |
| `CLIENT_URL` | URL of the frontend (e.g., `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | OAuth Client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret from Google Cloud Console |
| `GEMINI_API_KEY` | API Key for Google's Gemini AI |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | URL of the backend API (e.g., `http://localhost:5000/api`) |

## 💻 Running Locally

To run the application locally, you will need to start both the frontend and backend servers.

**Start the Backend server:**
```bash
cd backend
npm start
```
*The server should run on `http://localhost:5000`*

**Start the Frontend dev server:**
```bash
cd frontend
npm start
```
*The React app should open at `http://localhost:3000`*

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/jobserv/issues) if you want to contribute.

## 📝 License

This project is licensed under the **ISC License**.
