import React from "react";
import { FaExclamationTriangle, FaHome, FaRedo } from "react-icons/fa";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("AeroLearn UI recovery:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="app-recovery-screen">
        <div className="app-recovery-card">
          <div className="app-recovery-icon"><FaExclamationTriangle /></div>
          <span className="al-eyebrow">AEROLEARN RECOVERY</span>
          <h1>This workspace hit an unexpected display problem.</h1>
          <p>Your data was not deleted. Reload the workspace, or return to the dashboard and continue.</p>
          <div className="app-recovery-actions">
            <button onClick={() => window.location.reload()}><FaRedo /> Reload workspace</button>
            <button className="secondary" onClick={() => { window.location.href = "/dashboard"; }}><FaHome /> Dashboard</button>
          </div>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
