import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Courses from "./Components/Courses"; // Create this component
import Testimonal from "./Components/Testimonal";
import Carousel from "./Components/Carousel";
import OnlinePP from "./Components/OnlinePP"; // Create this component
import OfflinePP from "./Components/OfflinePP"; // Create this component
import Teachers from "./Components/Teachers";
import FreeTrials from "./Components/FreeTrials";

function App() {
  return (
    <Router>
      <div className="main-content">
        <Navbar />
        <Routes>
          <Route path="/testimonal" element={<Testimonal />} />
          <Route path="/carousel" element={<Carousel />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/pricing-plan/online" element={<OnlinePP />} />
          <Route path="/pricing-plan/offline" element={<OfflinePP />} />
          <Route path="/teacher" element={<Teachers />} />
          <Route path="/freeTrails" element={<FreeTrials/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
