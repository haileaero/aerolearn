import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";

const UIContext = createContext(null);
export const useUI = () => useContext(UIContext);

export default function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);

  const toast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3200);
  }, []);

  const confirm = useCallback((options = {}) => new Promise((resolve) => {
    setDialog({
      title: options.title || "Confirm action",
      message: options.message || "Are you sure you want to continue?",
      confirmText: options.confirmText || "Confirm",
      tone: options.tone || "danger",
      resolve,
    });
  }), []);

  const closeDialog = useCallback((value) => {
    setDialog((current) => {
      if (current?.resolve) current.resolve(value);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!dialog) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") closeDialog(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dialog, closeDialog]);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);
  const iconFor = (type) => type === "error" ? <FaExclamationTriangle /> : type === "info" ? <FaInfoCircle /> : <FaCheckCircle />;

  return <UIContext.Provider value={value}>
    {children}
    <div className="al-toast-stack" aria-live="polite">
      {toasts.map((item) => <div key={item.id} className={`al-toast ${item.type}`}><span className="al-toast-icon">{iconFor(item.type)}</span><span>{item.message}</span><button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== item.id))}><FaTimes /></button></div>)}
    </div>
    {dialog && <div className="al-dialog-backdrop" role="presentation" onMouseDown={() => closeDialog(false)}>
      <div className="al-dialog" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className={`al-dialog-mark ${dialog.tone}`}><FaExclamationTriangle /></div>
        <div><h3>{dialog.title}</h3><p>{dialog.message}</p></div>
        <div className="al-dialog-actions"><button className="al-dialog-cancel" onClick={() => closeDialog(false)}>Cancel</button><button className={`al-dialog-confirm ${dialog.tone === "danger" ? "danger" : "primary"}`} onClick={() => closeDialog(true)}>{dialog.confirmText}</button></div>
      </div>
    </div>}
  </UIContext.Provider>;
}
