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
        <main className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-[#f6f8fb] px-5 py-16">
          <div className="w-full max-w-lg rounded-3xl border border-[#e4e7ec] bg-[#ffffff] p-8 text-center shadow-lg">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#faebda] text-2xl">
              ⚠️
            </div>
            <h1 className="mt-5 text-3xl font-black text-[#14213d]">
              Something went wrong
            </h1>
            <p className="mt-3 text-base leading-7 text-[#667085]">
              CineBook could not display this page correctly. Please try again.
            </p>
            <button
              onClick={this.handleRetry}
              className="mt-7 rounded-xl bg-[#e4572e] px-6 py-3.5 text-base font-black text-white transition hover:bg-[#c94423]"
            >
              Try Again
            </button>
            {this.state.message && (
              <p className="mt-4 break-words text-xs text-[#aa9d85]">
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
