import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Ensure you have the necessary styles

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prevState => !prevState);
  };

  // Close the mobile menu when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.site-mobile-menu') && !event.target.closest('.burger')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <div className={`site-mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="site-mobile-menu-header">
          <div className="site-mobile-menu-close" onClick={toggleMobileMenu}>
            <span className="icofont-close" />
          </div>
        </div>
        <div className="site-mobile-menu-body">
          <ul className="site-menu">
            <li>
              <Link to="/" onClick={toggleMobileMenu}>Home</Link>
            </li>
            <li>
              <Link to="/Ingredients" onClick={toggleMobileMenu}>Ingredients</Link>
            </li>
            <li>
              <Link to="/history" onClick={toggleMobileMenu}>History</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Desktop Menu */}
      <nav className="site-nav">
        <div className="container">
          <div className="menu-bg-wrap">
            <div className="site-navigation">
              <div className="row g-0 align-items-center">
                <div className="col-2">
                  <Link to="/" className="logo m-0 float-start">Let's cook<span className="text-primary">.</span></Link>
                </div>
                <div className="col-8 text-center">
                 
                  <ul className="js-clone-nav d-none d-lg-inline-block text-start site-menu mx-auto">
                    <li className="active">
                      <Link to="/">Home</Link>
                    </li>
                    <li className="active">
                      <Link to="/Ingredients">Ingredients</Link>
                    </li>
                    <li className="active">
                      <Link to="/history">History</Link>
                    </li>
                  </ul>
                </div>
                <div className="col-2 text-end">
                  <a href="#" className={`burger ms-auto float-end site-menu-toggle js-menu-toggle d-inline-block d-lg-none ${isMobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}>
                    <span />
                  </a>
                  <form action="#" className="search-form d-none d-lg-inline-block">
                    <input type="text" className="form-control" placeholder="Search..." />
                    <span className="bi-search" />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
