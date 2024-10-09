import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import "./App.css";
import NotFound from "./pages/NotFound";
import Dishes from "./pages/Dishes/Dishes";
import Header from "./layouts/Header";

import Ingredients from "./pages/Ingredients/Ingredients";
import IngredientModal from "./pages/Dishes/Ingedientmodal"; 
import CreateDish from "./pages/Dishes/CreateDish";
import EditDish from "./pages/Dishes/EditDish";

function App() {

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Dishes />} />
        <Route path="/Ingredients" element={<Ingredients />} />
        <Route path="/creatdish" element={<CreateDish/>} />
        <Route path="/editedish" element={<EditDish/>} />
      
      </Routes>
      </>
  );
}

export default App;