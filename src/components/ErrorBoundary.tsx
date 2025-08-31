import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { logError, AppError } from '../lib/errorBoundary';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log the error
    logError(error, 'React Error Boundary');
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isAppError = this.state.error instanceof AppError;
      const isRecoverable = isAppError ? this.state.error.recoverable : true;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 shadow-2xl">
                  <Zap className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="mt-6 text-3xl font-bold text-white">
                Something went wrong
              </h1>
              <p className="mt-2 text-sm text-purple-300">
                {isAppError ? this.state.error.message : 'An unexpected error occurred'}
              </p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-purple-500/20">
              <div className="text-center space-y-4">
                {isRecoverable && (
                  <button
                    onClick={this.handleRetry}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </button>
                )}
                
                <button
                  onClick={() => window.location.reload()}
                  className="block w-full px-4 py-2 border border-purple-500/30 text-sm font-medium rounded-lg text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-white transition-all duration-200"
                >
                  Refresh Page
                </button>
                
                {import.meta.env.DEV && this.state.error && (
                  <details className="mt-4 text-left">
                    <summary className="text-xs text-purple-400 cursor-pointer">
                      Error Details (Development)
                    </summary>
                    <pre className="mt-2 text-xs text-red-300 bg-slate-900/50 p-3 rounded overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}