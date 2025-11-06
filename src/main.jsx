import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { HashRouter } from 'react-router-dom'
import { CajaProvider } from './context/CajaContext'

import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <CajaProvider>
        <App />
      </CajaProvider>
    </HashRouter>
  </StrictMode>,
)
