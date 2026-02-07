import { Component, ReactNode } from 'react';
import FatalStartupErrorScreen from './FatalStartupErrorScreen';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class StartupErrorBoundary extends Component<Props, State> {
  private errorHandler?: (event: ErrorEvent) => void;
  private rejectionHandler?: (event: PromiseRejectionEvent) => void;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Startup error caught by boundary:', error, errorInfo);
  }

  componentDidMount() {
    // Capture unhandled errors during early startup
    this.errorHandler = (event: ErrorEvent) => {
      console.error('Unhandled error during startup:', event.error);
      this.setState({ hasError: true, error: event.error });
      event.preventDefault();
    };

    this.rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection during startup:', event.reason);
      this.setState({ 
        hasError: true, 
        error: event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      });
      event.preventDefault();
    };

    window.addEventListener('error', this.errorHandler);
    window.addEventListener('unhandledrejection', this.rejectionHandler);

    // Cleanup after startup window (extended to match actor timeout)
    setTimeout(() => {
      if (this.errorHandler) {
        window.removeEventListener('error', this.errorHandler);
      }
      if (this.rejectionHandler) {
        window.removeEventListener('unhandledrejection', this.rejectionHandler);
      }
    }, 35000); // 35 seconds to cover actor init timeout + buffer
  }

  componentWillUnmount() {
    if (this.errorHandler) {
      window.removeEventListener('error', this.errorHandler);
    }
    if (this.rejectionHandler) {
      window.removeEventListener('unhandledrejection', this.rejectionHandler);
    }
  }

  render() {
    if (this.state.hasError) {
      return <FatalStartupErrorScreen error={this.state.error} />;
    }

    return this.props.children;
  }
}
