import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/common.css';

// Set basename for GitHub Pages deployment
// Ensure basename ends with / and doesn't have trailing issues
let basename = import.meta.env.BASE_URL || '/QingWen-YuweiMa-project2/';
// Remove trailing slash if present, then add it back to ensure consistency
basename = basename.endsWith('/') ? basename : basename + '/';
// Remove leading slash issues
basename = basename.startsWith('/') ? basename : '/' + basename;

// Set CSS variable for base URL
const baseUrl = basename;
document.documentElement.style.setProperty('--base-url', baseUrl);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
