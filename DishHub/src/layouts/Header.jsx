import React from 'react'
import { Link } from 'react-router-dom';


const Header = () => {
  return (
    <>
        <div className="site-mobile-menu site-navbar-target">
    <div className="site-mobile-menu-header">
      <div className="site-mobile-menu-close">
        <span className="icofont-close js-menu-toggle" />
      </div>
    </div>
    <div className="site-mobile-menu-body" />
  </div>
  <nav className="site-nav">
    <div className="container">
      <div className="menu-bg-wrap">
        <div className="site-navigation">
          <div className="row g-0 align-items-center">
            <div className="col-2">
              <a href="index.html" className="logo m-0 float-start">Let's cook<span className="text-primary">.</span></a>
            </div>
            <div className="col-8 text-center">
              <form action="#" className="search-form d-inline-block d-lg-none">
                <input type="text" className="form-control" placeholder="Search..." />
                <span className="bi-search" />
              </form>
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
              <a href="#" className="burger ms-auto float-end site-menu-toggle js-menu-toggle d-inline-block d-lg-none light">
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
  )
}

export default Header
