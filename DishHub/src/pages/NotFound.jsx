import React from 'react'
import { Link } from 'react-router-dom'
import { useRouteError } from 'react-router-dom';
const NotFound = () => {
    const error = useRouteError();
    console.error(error); // Log the error for debugging (optional)
  
    return (
      <div>
        <h1>Oops! Something went wrong.</h1>
        <p>{error.statusText || error.message}</p>
        <p>Please try refreshing the page or go back to the home page.</p>
      </div>
    );
  };
  

export default NotFound
