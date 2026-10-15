import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unexpected error" };
  }

  componentDidCatch(error, info) {
    console.error("CineBook ErrorBoundary:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-canvas px-5 py-16 font-sans text-ink-primary">
          <div className="w-full max-w-lg rounded-2xl border border-canvas-muted bg-surface p-8 text-center shadow-cozy">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl">
              ⚠️
            </div>
            <h1 className="mt-5 font-serif text-3xl font-bold tracking-tight text-ink-primary">
              Something went wrong
            </h1>
            <p className="mt-3 font-sans text-base leading-7 text-ink-secondary">
              CineBook could not display this page correctly. Please try again.
            </p>
            <button
              onClick={this.handleRetry}
              className="mt-7 rounded-xl bg-brand px-6 py-3.5 font-sans text-base font-semibold text-white shadow-cozy transition hover:bg-brand-hover active:scale-[0.99]"
            >
              Try Again
            </button>
            {this.state.message && (
              <p className="mt-4 break-words font-sans text-xs text-ink-tertiary">
                {this.state.message}
              </p>
            )}
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
