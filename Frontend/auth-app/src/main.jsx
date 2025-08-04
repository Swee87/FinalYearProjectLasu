import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

// Wrap your app with PersistGate
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </PersistGate>
  </Provider>
);

