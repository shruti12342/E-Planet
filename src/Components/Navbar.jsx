import React, { useState } from "react";
import "./Navbar.css";
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleMouseEnter = () => {
    setDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    setDropdownVisible(false);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <h2>Admin Panel</h2>
          <div className="navbar-links">
            <Link to="/testimonal">Testimonal</Link>
            <Link to="/carousel">Carousel</Link>
            <Link to="/courses">Courses</Link>
            <Link to="/freeTrails">Free Trails</Link>
            <Link to="/teacher">Employees</Link>

            {/* Pricing Plan Dropdown */}
            <div
              className="dropdown"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span className="dropdown-link">Pricing Plan</span>
              {dropdownVisible && (
                <div className="dropdown-menu">
                  <Link to="/pricing-plan/online" className="dropdown-item">
                    Online
                  </Link>
                  <Link to="/pricing-plan/offline" className="dropdown-item">
                    Offline
                  </Link>
                </div>
              )}
            </div>
            
            <button className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
