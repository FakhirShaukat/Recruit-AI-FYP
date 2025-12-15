import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import {SearchProvider} from './contexts/SearchContext.jsx'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard';
import AddJobs from './pages/AddJobs';
import ResumeScreening from './pages/ResumeScreening';
import Ranking from './pages/Ranking';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import UploadResume from './pages/UploadResume';
import PreviousRankings from './components/PreviousRankings.jsx';

function App() {

  return (
    <Router>
      <SearchProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/addjobs" element={<AddJobs />} />
        <Route path="/screening" element={<ResumeScreening />} />
        <Route path="/apply/:jobId" element={<UploadResume />} /> {/* 🔥 unique link */}
        <Route path="/ranking/:jobId" element={<Ranking />} />
        <Route path="/prevranking" element={<PreviousRankings />} />
        <Route path="/uploadresume" element={<UploadResume />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/adminpanel" element={<AdminPanel />} />
      </Routes>
      </SearchProvider>
    </Router>
  )
}

export default App
