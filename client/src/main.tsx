import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { TeamProvider } from '@/context/TeamContext'
import '@/styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TeamProvider>
        <App />
        <Toaster
          position="top-center"
          containerStyle={{
            top: '1rem',
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1A3A52',
              color: '#F5F5DC',
              border: '2px solid #D4AF37',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              maxWidth: '90vw',
              wordBreak: 'break-word',
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
