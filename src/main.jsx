import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n";
import "./index.css";
import App from "./App.jsx";

// Defensive monkeypatch to prevent "removeChild" / "insertBefore" DOM crashes
// caused by browser auto-translation (Google Translate) or third-party extensions modifying nodes
if (typeof Node === "function" && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) {
      if (console && console.warn) {
        console.warn("removeChild: node is not a child of this parent", child, this);
      }
      if (child.parentNode) {
        try {
          return child.parentNode.removeChild(child);
        } catch {
          return child;
        }
      }
      return child;
    }
    try {
      return originalRemoveChild.apply(this, arguments);
    } catch (err) {
      if (console && console.warn) {
        console.warn("removeChild caught error:", err);
      }
      if (child && child.parentNode) {
        try {
          return child.parentNode.removeChild(child);
        } catch {}
      }
      return child;
    }
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console && console.warn) {
        console.warn("insertBefore: reference node is not a child of this parent", referenceNode, this);
      }
      if (referenceNode.parentNode) {
        try {
          return referenceNode.parentNode.insertBefore(newNode, referenceNode);
        } catch {
          return this.appendChild(newNode);
        }
      }
      return this.appendChild(newNode);
    }
    try {
      return originalInsertBefore.apply(this, arguments);
    } catch (err) {
      if (console && console.warn) {
        console.warn("insertBefore caught error:", err);
      }
      return this.appendChild(newNode);
    }
  };
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
