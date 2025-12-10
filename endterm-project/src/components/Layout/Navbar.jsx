import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../services/authService';
import './Navbar.css';

const Navbar = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="logo">
          TVMaze Explorer
        </NavLink>
        
        <ul className="nav-links">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/about" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/movies" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              TV Shows
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/favorites" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Favorites
            </NavLink>
          </li>
          
          {user ? (
            <>
              <li>
                <NavLink 
                  to="/profile" 
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  Profile
                </NavLink>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                  <span className="user-email">({user.email?.split('@')[0]})</span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink 
                  to="/login" 
                  className={({ isActive }) => isActive ? 'active login-link' : 'login-link'}
                >
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/signup" 
                  className={({ isActive }) => isActive ? 'active signup-btn' : 'signup-btn'}
                >
                  Sign Up
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;