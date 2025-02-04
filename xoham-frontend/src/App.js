import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import HospitalPage from './components/HospitalPage';
import InsurancePage from './components/InsurancePage';
import PatientPage from './components/PatientPage';


function App() {
  return (
    <div className="w-full h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hospital" element={<HospitalPage />} />
        <Route path="/insurance" element={<InsurancePage />} />
        <Route path="/patient" element={<PatientPage />} />

      </Routes>
    </div>
  );
}

export default App;
