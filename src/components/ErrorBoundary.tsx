"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="panel p-4 text-center">
          <div className="text-[var(--bb-red)] text-xs font-bold mb-2">Component Error</div>
          <div className="text-[var(--bb-muted)] text-[10px] mb-3">
            {this.state.error?.message || "Something went wrong"}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1 text-[10px] bg-[var(--bb-orange)] text-black rounded font-bold hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
