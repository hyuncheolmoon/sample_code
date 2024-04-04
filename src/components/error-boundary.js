import React, { Component } from "react";

class ErrorBoundary extends Component {
  static state = {
    error: null,
    errorInfo: null,
  };

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    const { error, errorInfo } = this.state;
    const { children } = this.props;
    if (!errorInfo) {
      return children;
    }
    return <div>{errorDetails}</div>;
  }
}

export default ErrorBoundary;
