import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-300 rounded bg-red-50">
          <h3 className="text-red-800 font-medium mb-2">Something went wrong</h3>
          <p className="text-red-600 text-sm">{this.state.error?.message || 'An error occurred while rendering this component'}</p>
          {this.props.fallback}
        </div>
      );
    }

    return this.props.children;
  }
}