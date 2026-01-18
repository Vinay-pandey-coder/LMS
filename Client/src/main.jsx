// main.jsx - React entry point with Redux setup

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './app/store'
import './index.css'
import App from './App.jsx'

// Wrap app with Redux Provider to make store available to all components
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)