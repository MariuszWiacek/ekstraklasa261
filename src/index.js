import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';

// 👇 ADD THIS
import { register } from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
<React.StrictMode>
<App />
</React.StrictMode>
);

// 👇 ADD THIS
register();

reportWebVitals();