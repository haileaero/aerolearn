import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import AuthProvider from "./context/AuthContext";
import UIProvider from "./context/UIContext";

/* ===========================
   Global Styles
=========================== */

import "./index.css";
import "./styles/variables.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/professional.css";

/* ===========================
   Render Application
=========================== */

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <BrowserRouter>
    <AuthProvider>
      <UIProvider>
        <App />
      </UIProvider>
    </AuthProvider>
  </BrowserRouter>
);
