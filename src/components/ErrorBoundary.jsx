import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '600px',
          margin: '50px auto'
        }}>
          <h1 style={{ color: '#d32f2f' }}>⚠️ Đã xảy ra lỗi</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Ứng dụng gặp sự cố. Vui lòng thử lại sau.
          </p>
          <details style={{ 
            textAlign: 'left', 
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Chi tiết lỗi (click để xem)
            </summary>
            <pre style={{ 
              marginTop: '10px',
              fontSize: '12px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

