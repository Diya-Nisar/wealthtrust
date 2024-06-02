import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import Store from "./redux/store";

// Get the root element from the DOM
const container = document.getElementById("root");

// Create a root
const root = createRoot(container);

// Initial render
root.render(
  <Provider store={Store}>
    <App />
  </Provider>
);

reportWebVitals();
