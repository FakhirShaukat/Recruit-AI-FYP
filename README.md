# 🚀 Recruit AI — AI-Driven Resume Screening & Candidate Shortlisting System

## 📌 Overview

Recruit AI is a full-stack web application designed to automate the recruitment process by leveraging Artificial Intelligence. It analyzes resumes, extracts key information, and matches candidates with job descriptions to shortlist the most suitable applicants efficiently.

---

## 🧠 Key Features

* 📄 Resume Parsing using AI (FastAPI)
* 🎯 Keyword-based Candidate Shortlisting
* 🔐 Secure Authentication (JWT + Google OAuth)
* 🌐 Full MERN Stack Application
* ⚡ Real-time API Integration between Node.js & FastAPI
* 📊 Efficient Data Handling with MongoDB

---

## 🏗 Tech Stack

### Frontend

* React.js
* Tailwind CSS

### Backend

* Node.js
* Express.js

### AI/ML Service

* FastAPI (Python)
* NLP-based Resume Parsing

### Database

* MongoDB Atlas

---

## 🧩 System Architecture

```
Client (React)
      ↓
Node.js Backend (API & Auth)
      ↓
FastAPI (AI Resume Processing)
      ↓
MongoDB Atlas (Database)
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/recruit-ai.git
cd recruit-ai
```

---

### 2️⃣ Setup Backend (Node.js)

```bash
cd backend
npm install
npm start
```

Create a `.env` file:

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
FASTAPI_URL=http://localhost:8000
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
```

---

### 3️⃣ Setup FastAPI (AI Service)

```bash
cd fastapi
pip install -r requirements.txt
uvicorn main:app --reload
```

---

### 4️⃣ Setup Frontend (React)

```bash
cd frontend
npm install
npm start
```

---

## 🚀 Deployment

### 🔹 Recommended Deployment Setup

* Frontend → Vercel
* Backend → Fly.io
* FastAPI → Fly.io
* Database → MongoDB Atlas

---

### 🌐 Live URLs (Example)

* Frontend: https://your-frontend.vercel.app
* Backend API: https://your-backend.fly.dev
* FastAPI Service: https://your-fastapi.fly.dev

---

## 🔐 Environment Variables

### Backend (.env)

```
MONGO_URI=
JWT_SECRET=
FASTAPI_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## 📸 Screenshots

*(Add your project screenshots here)*

---

## 🎯 Future Enhancements

* 📊 Candidate Ranking System
* 📧 Email Notifications for Shortlisted Candidates
* 📈 Dashboard Analytics for Recruiters
* 🤖 Advanced ML Model for Better Matching

---

## 👨‍💻 Author

**Fakhir Shaukat**
Software Engineering Student

---

## ⭐ Acknowledgements

* OpenAI & NLP resources
* MongoDB Atlas
* FastAPI & Express communities

---

## 📄 License

This project is for educational purposes (Final Year Project).
