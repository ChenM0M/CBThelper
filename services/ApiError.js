export class ApiError extends Error {
  constructor(message, code, details = null, status = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
  }

  static fromResponse(response, data) {
    const status = response.status;
    const message = data?.message || `请求失败 (${status})`;
    const code = data?.code || 'API_ERROR';
    const details = data?.details || null;
    
    return new ApiError(message, code, details, status);
  }

  static fromError(error) {
    return new ApiError(
      error.message || '未知错误',
      'INTERNAL_ERROR',
      error.stack,
      500
    );
  }
} 