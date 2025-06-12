import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Oops! Terjadi kesalahan
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Aplikasi mengalami masalah. Silakan refresh halaman atau coba lagi nanti.
            </p>
            <div className="mb-6">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Refresh Halaman
              </button>
            </div>
            <div className="text-left bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto max-h-60 text-xs">
              <p className="font-mono text-red-600 dark:text-red-400">
                {this.state.error && this.state.error.toString()}
              </p>
              <p className="font-mono text-gray-700 dark:text-gray-300 mt-2">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;