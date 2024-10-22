import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from "react-router-dom";
import Dishes from "./pages/Dishes/Dishes.jsx";
import Header from "./layouts/Header.jsx";
import Ingredients from "./pages/Ingredients/Ingredients.jsx";
// import Ingedientmodal from "./pages/Dishes/Ingedientmodal.jsx";
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
      
        <App />
       
      </BrowserRouter>
    </QueryClientProvider>
   </StrictMode>
);
