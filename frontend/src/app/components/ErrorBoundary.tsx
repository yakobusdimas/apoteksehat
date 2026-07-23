/**
 * Error Boundary — catches React rendering errors and shows a fallback UI.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.name ? `: ${this.props.name}` : ''}]`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <span className="text-xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Terjadi Kesalahan
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md">
            Komponen{this.props.name ? ` ${this.props.name}` : ''} mengalami error.
            {this.props.name !== 'Chatbot' && this.props.name !== 'Dashboard' && (
              <span> Coba refresh halaman.</span>
            )}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="rounded-lg"
          >
            Coba Lagi
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
