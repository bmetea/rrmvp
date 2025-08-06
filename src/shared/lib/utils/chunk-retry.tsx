"use client";

import React, { Component, ReactNode } from "react";

interface ChunkErrorBoundaryState {
  hasError: boolean;
  chunkError: boolean;
  retryCount: number;
}

interface ChunkErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  maxRetries?: number;
  onRetry?: () => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export class ChunkErrorBoundary extends Component<
  ChunkErrorBoundaryProps,
  ChunkErrorBoundaryState
> {
  private retryTimer: NodeJS.Timeout | null = null;

  constructor(props: ChunkErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      chunkError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<ChunkErrorBoundaryState> {
    // Check if this is a chunk loading error
    const isChunkError =
      error.name === "ChunkLoadError" ||
      error.message.includes("Loading chunk") ||
      error.message.includes("Loading CSS chunk");

    return {
      hasError: true,
      chunkError: isChunkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ChunkErrorBoundary caught an error:", error, errorInfo);

    // If it's a chunk error and we haven't exceeded max retries, attempt to retry
    if (
      this.state.chunkError &&
      this.state.retryCount < (this.props.maxRetries || MAX_RETRIES)
    ) {
      this.retryChunkLoad();
    }
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  retryChunkLoad = () => {
    const delay = RETRY_DELAY * (this.state.retryCount + 1); // Exponential backoff

    this.retryTimer = setTimeout(() => {
      console.log(`Retrying chunk load (attempt ${this.state.retryCount + 1})`);

      this.setState((prevState) => ({
        hasError: false,
        chunkError: false,
        retryCount: prevState.retryCount + 1,
      }));

      // Call custom retry handler if provided
      this.props.onRetry?.();
    }, delay);
  };

  handleManualRetry = () => {
    // Force page reload as last resort
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (
        this.state.chunkError &&
        this.state.retryCount < (this.props.maxRetries || MAX_RETRIES)
      ) {
        // Show loading state while retrying
        return (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">
                Loading content... (attempt {this.state.retryCount + 1})
              </p>
            </div>
          </div>
        );
      }

      // Show custom fallback or default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-gray-50 rounded-lg">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {this.state.chunkError
                ? "There was a problem loading this content. This usually happens due to a network issue or a recent update."
                : "An unexpected error occurred."}
            </p>
            <button
              onClick={this.handleManualRetry}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for chunk loading retry in functional components
export function useChunkRetry() {
  const retryChunk = React.useCallback(() => {
    // Force a refresh of the current page to reload all chunks
    window.location.reload();
  }, []);

  return { retryChunk };
}

// Higher-order component for automatic chunk error handling
export function withChunkErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    maxRetries?: number;
  }
) {
  const WithChunkErrorBoundary = (props: P) => (
    <ChunkErrorBoundary
      fallback={options?.fallback}
      maxRetries={options?.maxRetries}
    >
      <WrappedComponent {...props} />
    </ChunkErrorBoundary>
  );

  WithChunkErrorBoundary.displayName = `withChunkErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return WithChunkErrorBoundary;
}
