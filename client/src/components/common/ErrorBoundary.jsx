import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[PulseCare ErrorBoundary caught]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/patient';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 border border-neutral-200 shadow-lg text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900">Consultation Session Notice</h2>
              <p className="text-sm text-neutral-600">
                A temporary interface error occurred. Your clinical data has been preserved.
              </p>
              {this.state.error?.message && (
                <div className="p-3 bg-neutral-50 rounded-lg text-xs font-mono text-neutral-700 text-left overflow-x-auto border border-neutral-200">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 h-12 rounded-xl bg-brand-marigold hover:bg-brand-marigoldDark text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Return to Triage</span>
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = '/'; }}
                className="h-12 px-4 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
