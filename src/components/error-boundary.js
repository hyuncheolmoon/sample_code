import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor() {
    super();
    this.state = {
      errorData: null,
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      errorData: { error, errorInfo },
    });
  }

  render() {
    const { children } = this.props;
    const { errorData } = this.state;
    if (!errorData) {
      return children;
    }
    return <div>{"error"}</div>;
  }
}

export default ErrorBoundary;
