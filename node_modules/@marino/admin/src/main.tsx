import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/plus-jakarta-sans'
import './index.css'
import { AppRouter } from './router'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Admin root element #root is missing from index.html')
}

createRoot(container).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
