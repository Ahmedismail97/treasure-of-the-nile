import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { TeamProvider } from './context/TeamContext.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TeamProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1A3A52',
              color: '#F5F5DC',
              border: '2px solid #D4AF37',
              borderRadius: '8px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#D4AF37',
                secondary: '#1A3A52',
              },
            },
          }}
        />
      </TeamProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
