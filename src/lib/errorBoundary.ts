// Error boundary utilities for better error handling

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleSupabaseError(error: any): AppError {
  console.error('Supabase error:', error);
  
  if (error?.message?.includes('fetch')) {
    return new AppError(
      'Network connection failed. Please check your internet connection.',
      'NETWORK_ERROR',
      true
    );
  }
  
  if (error?.message?.includes('timeout')) {
    return new AppError(
      'Connection timeout. Please try again.',
      'TIMEOUT_ERROR',
      true
    );
  }
  
  if (error?.code === 'PGRST301') {
    return new AppError(
      'Database connection failed. Please try again later.',
      'DB_CONNECTION_ERROR',
      true
    );
  }
  
  return new AppError(
    error?.message || 'An unexpected error occurred',
    error?.code || 'UNKNOWN_ERROR',
    true
  );
}

export function logError(error: Error | AppError, context?: string) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    context,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError && {
        code: error.code,
        recoverable: error.recoverable
      })
    },
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.error('🚨 Application Error:', logData);
  
  // In production, you might want to send this to an error tracking service
  if (import.meta.env.PROD) {
    // Example: Send to error tracking service
    // errorTrackingService.captureError(logData);
  }
}