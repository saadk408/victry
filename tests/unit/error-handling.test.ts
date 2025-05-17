// File: /tests/unit/error-handling.test.ts

/**
 * Unit tests for error handling utilities in lib/supabase/client.ts
 */

import { handleSupabaseError, isRetryableError, retryOperation } from '../../lib/supabase/client';

describe('Error Handling Utilities', () => {
  describe('handleSupabaseError', () => {
    it('should handle known error codes with friendly messages', () => {
      const knownError = {
        code: 'PGRST116',
        message: 'Some technical error message',
        details: { additional: 'details' }
      };
      
      const result = handleSupabaseError(knownError);
      
      expect(result.message).toBe('Resource not found');
      expect(result.code).toBe('PGRST116');
      expect(result.details).toEqual({ additional: 'details' });
    });
    
    it('should handle unique constraint violations', () => {
      const constraintError = {
        code: '23505',
        message: 'duplicate key value violates unique constraint'
      };
      
      const result = handleSupabaseError(constraintError);
      
      expect(result.message).toBe('Unique constraint violation');
      expect(result.code).toBe('23505');
    });
    
    it('should handle auth errors', () => {
      const authError = {
        code: 'auth-user-not-found',
        message: 'User not found'
      };
      
      const result = handleSupabaseError(authError);
      
      expect(result.message).toBe('User not found');
      expect(result.code).toBe('auth-user-not-found');
    });
    
    it('should handle unknown errors with appropriate fallback', () => {
      const unknownError = {
        code: 'UNKNOWN',
        message: 'An unknown error occurred'
      };
      
      const result = handleSupabaseError(unknownError);
      
      expect(result.message).toBe('An unknown error occurred');
      expect(result.code).toBe('UNKNOWN');
    });
    
    it('should handle non-object errors', () => {
      const stringError = 'Simple string error';
      
      const result = handleSupabaseError(stringError);
      
      expect(result.message).toBe('Simple string error');
      expect(result.details).toBe(stringError);
    });
  });
  
  describe('isRetryableError', () => {
    it('should identify network errors as retryable', () => {
      const networkError = {
        message: 'network error: connection reset'
      };
      
      expect(isRetryableError(networkError)).toBe(true);
    });
    
    it('should identify timeout errors as retryable', () => {
      const timeoutError = {
        message: 'timeout exceeded'
      };
      
      expect(isRetryableError(timeoutError)).toBe(true);
    });
    
    it('should identify serialization failures as retryable', () => {
      const serializationError = {
        code: '40001' // serialization failure
      };
      
      expect(isRetryableError(serializationError)).toBe(true);
    });
    
    it('should not mark constraint violations as retryable', () => {
      const constraintError = {
        code: '23505' // unique constraint violation
      };
      
      expect(isRetryableError(constraintError)).toBe(false);
    });
    
    it('should not mark auth errors as retryable', () => {
      const authError = {
        code: 'auth-invalid-credentials'
      };
      
      expect(isRetryableError(authError)).toBe(false);
    });
  });
  
  describe('retryOperation', () => {
    it('should retry retryable errors up to maxRetries times', async () => {
      // Create a function that fails with a retryable error a few times then succeeds
      const mockOperation = jest.fn()
        .mockRejectedValueOnce({ message: 'network error' })
        .mockRejectedValueOnce({ message: 'timeout error' })
        .mockResolvedValueOnce('success');
      
      const result = await retryOperation(mockOperation, 3, 10);
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });
    
    it('should not retry non-retryable errors', async () => {
      // Create a function that fails with a non-retryable error
      const mockOperation = jest.fn()
        .mockRejectedValueOnce({ code: '23505' }); // unique constraint violation
      
      await expect(retryOperation(mockOperation, 3, 10))
        .rejects
        .toEqual({ code: '23505' });
      
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
    
    it('should throw the last error if all retries fail', async () => {
      // Create a function that always fails with a retryable error
      const mockOperation = jest.fn()
        .mockRejectedValue({ message: 'network error' });
      
      await expect(retryOperation(mockOperation, 2, 10))
        .rejects
        .toBeInstanceOf(Error);
      
      expect(mockOperation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
});
