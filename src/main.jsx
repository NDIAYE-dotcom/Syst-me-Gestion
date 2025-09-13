import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SalesRefreshProvider } from './context/SalesRefreshContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SalesRefreshProvider>
        <App />
      </SalesRefreshProvider>
    </BrowserRouter>
  </StrictMode>,
)
