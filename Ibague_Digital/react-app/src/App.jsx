import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Surveys from "./pages/Surveys";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Header />
      <nav className="bg-gray-100 p-4 flex justify-center space-x-4">
        <Link className="hover:text-blue-600 font-medium" to="/">Inicio</Link>
        <Link className="hover:text-blue-600 font-medium" to="/surveys">Encuestas</Link>
        <Link className="hover:text-blue-600 font-medium" to="/dashboard">Dashboard</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/surveys" element={<Surveys />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
