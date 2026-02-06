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
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error during startup:', event.error);
      this.setState({ hasError: true, error: event.error });
      event.preventDefault();
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection during startup:', event.reason);
      this.setState({ 
        hasError: true, 
        error: event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      });
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // Cleanup after a short delay (only catch early startup errors)
    setTimeout(() => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    }, 5000);
  }

  render() {
    if (this.state.hasError) {
      return <FatalStartupErrorScreen error={this.state.error} />;
    }

    return this.props.children;
  }
}
