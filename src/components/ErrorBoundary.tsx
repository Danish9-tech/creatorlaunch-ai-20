import React from "react";

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Ignore errors from browser extensions
    if (error.stack?.includes("chrome-extension://")) {
      this.setState({ hasError: false });
      return;
    }
    console.error("App error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 text-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">Please refresh the page or try in incognito mode.</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
