// components/error-boundary.tsx
"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorBoundary as HighlightErrorBoundary } from "@highlight-run/next/client";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enhanced ErrorBoundary component that provides better error handling
 * and customizable fallback UI for different parts of the application.
 */
class EnhancedErrorBoundary extends Component<Props, State> {
  state: State = { 
    hasError: false,
    error: null
  };
  
  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error(`Error in ${this.props.componentName || 'component'}:`, error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-4 rounded-md bg-red-900/20 border border-red-800">
          <h2 className="text-lg font-medium text-red-200 mb-2">Something went wrong</h2>
          <p className="text-sm text-red-300 mb-3">
            {this.props.componentName 
              ? `The ${this.props.componentName} component couldn't be loaded.` 
              : 'This component couldn\'t be loaded.'}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })} 
            className="px-3 py-1 text-sm bg-red-800 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

/**
 * Main ErrorBoundary component that combines our enhanced boundary with Highlight's
 * error reporting for production environments.
 */
export function ErrorBoundary({ 
  children, 
  fallback, 
  componentName,
  onError 
}: Props) {
  // In development, use our enhanced error boundary for better debugging
  if (process.env.NODE_ENV === 'development') {
    return (
      <EnhancedErrorBoundary 
        fallback={fallback}
        componentName={componentName}
        onError={onError}
      >
        {children}
      </EnhancedErrorBoundary>
    );
  }
  
  // In production, wrap with Highlight's error boundary for reporting
  return (
    <HighlightErrorBoundary showDialog={false}>
      <EnhancedErrorBoundary 
        fallback={fallback}
        componentName={componentName}
        onError={onError}
      >
        {children}
      </EnhancedErrorBoundary>
    </HighlightErrorBoundary>
  );
}
