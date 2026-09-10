import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackendStatusBanner from './components/BackendStatusBanner';
import LocationPromptModal from './components/LocationPromptModal';
import Home from './pages/Home';
import Services from './pages/Services';
import Workers from './pages/Workers';
import WorkerProfile from './pages/WorkerProfile';
import BookingDetails from './pages/BookingDetails';
import CustomerDashboard from './pages/CustomerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AboutCooperative from './pages/AboutCooperative';
import WelfareFund from './pages/WelfareFund';
import Login from './pages/Login';
import Register from './pages/Register';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#1E1E1E]">
      <LocationPromptModal />
      <Navbar />
      <BackendStatusBanner />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/workers/:id" element={<WorkerProfile />} />
          <Route path="/booking/:id" element={<BookingDetails />} />
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/worker" element={<WorkerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/about-cooperative" element={<AboutCooperative />} />
          <Route path="/welfare" element={<WelfareFund />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
