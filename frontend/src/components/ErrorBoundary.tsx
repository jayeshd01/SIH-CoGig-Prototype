import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4] p-6">
          <div className="bg-white max-w-lg w-full p-8 rounded-2xl shadow-lg border border-gray-200 text-center space-y-4">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
              !
            </div>
            <h2 className="text-xl font-bold text-gray-900">Something didn't load right</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred. You can retry to reload the view.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-6 py-2.5 bg-[#1B6B3A] hover:bg-[#145A2F] text-white text-sm font-bold rounded-xl transition shadow-sm cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
