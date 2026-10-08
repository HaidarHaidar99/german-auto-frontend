import React from "react";
import Button from "../ui/Button";
import Icon from "../common/Icon";

export class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AdminErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "32px",
            backgroundColor: "var(--color-admin-card, #ffffff)",
            borderRadius: "16px",
            border: "1px solid var(--color-admin-border, rgba(0, 0, 0, 0.08))",
            maxWidth: "700px",
            margin: "40px auto",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ef4444",
            }}
          >
            <Icon name="alert-circle" size={28} />
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 800,
              color: "var(--color-admin-text, #0f172a)",
            }}
          >
            Ein unerwarteter Fehler ist aufgetreten
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "var(--color-admin-muted, #64748b)",
              lineHeight: 1.6,
              maxWidth: "500px",
            }}
          >
            {this.state.error?.message ||
              "Die Seite konnte nicht geladen werden. Bitte versuchen Sie es erneut oder navigieren Sie zurück zum Dashboard."}
          </p>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <Button variant="primary" size="sm" onClick={this.handleReset}>
              <Icon name="refresh-cw" size={14} />
              <span style={{ marginLeft: "6px" }}>Seite neu laden</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = "/admincoresecure";
              }}
            >
              Zum Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;
