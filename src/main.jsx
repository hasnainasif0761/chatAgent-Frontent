import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastContainer position="top-right" theme="dark" autoClose={3000} />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
