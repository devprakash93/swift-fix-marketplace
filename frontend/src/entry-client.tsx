import { createRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start/client'

createRoot(document.getElementById('root')!).render(
  <StartClient />
)
