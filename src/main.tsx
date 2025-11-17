import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ProjectProvider } from './state/projectStore'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProjectProvider>
      <App />
    </ProjectProvider>
  </React.StrictMode>,
)
