import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withRouteErrorLogging } from '@/lib/middlewares/error-logging-middleware';
import { 
  ErrorCategory, 
  ErrorCode, 
  createValidationError,
  createAuthError,
  createNotFoundError
} from '@/lib/utils/error-utils';
import { getLogger } from '@/lib/utils/logger';
import { createClient } from '@/lib/supabase/client';
import { withRetry } from '@/lib/utils/retry-utils';

// Create a logger for this API route
const logger = getLogger().child('api-example');

// Validation schema for request body
const requestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  message: z.string().min(10, "Message must be at least 10 characters").max(500, "Message must be at most 500 characters"),
});

// Type for validated request
type ValidatedRequest = z.infer<typeof requestSchema>;

// Handler for GET requests
async function handleGet(req: NextRequest): Promise<NextResponse> {
  logger.info('Example GET request received');
  
  // Simulate getting data with retry for transient errors
  const data = await withRetry(async () => {
    const supabase = createClient();
    
    // This is just an example, replace with your actual data fetching logic
    const { data, error } = await supabase
      .from('example_table')
      .select('*')
      .limit(10);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  });
  
  return NextResponse.json({ success: true, data });
}

// Handler for POST requests
async function handlePost(req: NextRequest): Promise<NextResponse> {
  logger.info('Example POST request received');
  
  // Validate request body
  let body: ValidatedRequest;
  try {
    body = await validateRequest(req);
  } catch (error) {
    logger.warn('Invalid request body', { error });
    return NextResponse.json(error, { status: 400 });
  }
  
  // Check authentication (example)
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    logger.warn('Unauthenticated request');
    throw createAuthError('You must be logged in to perform this action');
  }
  
  // Process the request (example)
  try {
    logger.info('Processing example request', { name: body.name, email: body.email });
    
    // Simulate database operation with retry
    const result = await withRetry(async () => {
      // This is just an example, replace with your actual processing logic
      const { data, error } = await supabase
        .from('example_table')
        .insert({
          name: body.name,
          email: body.email,
          message: body.message,
          user_id: session.user.id,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    });
    
    logger.info('Example request processed successfully', { id: result.id });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Your message has been received', 
      id: result.id 
    });
  } catch (error) {
    // Log error with more context
    logger.error('Failed to process example request', error, {
      name: body.name,
      email: body.email,
    });
    
    // Re-throw to let error middleware handle it
    throw error;
  }
}

// Handler for PUT requests
async function handlePut(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    throw createValidationError('ID parameter is required');
  }
  
  logger.info('Example PUT request received', { id });
  
  // Validate request body
  let body: ValidatedRequest;
  try {
    body = await validateRequest(req);
  } catch (error) {
    logger.warn('Invalid request body', { error, id });
    return NextResponse.json(error, { status: 400 });
  }
  
  // Check authentication (example)
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    logger.warn('Unauthenticated request', { id });
    throw createAuthError('You must be logged in to perform this action');
  }
  
  // Check if resource exists and user has access
  const { data: existingData, error: fetchError } = await supabase
    .from('example_table')
    .select('id, user_id')
    .eq('id', id)
    .single();
  
  if (fetchError || !existingData) {
    logger.warn('Resource not found', { id });
    throw createNotFoundError('Example resource', id);
  }
  
  if (existingData.user_id !== session.user.id) {
    logger.warn('Unauthorized access attempt', { 
      id, 
      userId: session.user.id,
      resourceOwnerId: existingData.user_id
    });
    
    throw {
      message: 'You do not have permission to update this resource',
      category: ErrorCategory.PERMISSION,
      code: ErrorCode.PERMISSION_DENIED,
    };
  }
  
  // Process the update
  try {
    logger.info('Processing example update', { id, name: body.name });
    
    // Simulate database operation with retry
    const result = await withRetry(async () => {
      const { data, error } = await supabase
        .from('example_table')
        .update({
          name: body.name,
          email: body.email,
          message: body.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    });
    
    logger.info('Example update processed successfully', { id });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Your message has been updated', 
      data: result
    });
  } catch (error) {
    // Log error with more context
    logger.error('Failed to process example update', error, {
      id,
      name: body.name,
    });
    
    // Re-throw to let error middleware handle it
    throw error;
  }
}

// Handler for DELETE requests
async function handleDelete(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    throw createValidationError('ID parameter is required');
  }
  
  logger.info('Example DELETE request received', { id });
  
  // Check authentication (example)
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    logger.warn('Unauthenticated request', { id });
    throw createAuthError('You must be logged in to perform this action');
  }
  
  // Check if resource exists and user has access
  const { data: existingData, error: fetchError } = await supabase
    .from('example_table')
    .select('id, user_id')
    .eq('id', id)
    .single();
  
  if (fetchError || !existingData) {
    logger.warn('Resource not found', { id });
    throw createNotFoundError('Example resource', id);
  }
  
  if (existingData.user_id !== session.user.id) {
    logger.warn('Unauthorized access attempt', { 
      id, 
      userId: session.user.id,
      resourceOwnerId: existingData.user_id
    });
    
    throw {
      message: 'You do not have permission to delete this resource',
      category: ErrorCategory.PERMISSION,
      code: ErrorCode.PERMISSION_DENIED,
    };
  }
  
  // Process the deletion
  try {
    logger.info('Processing example deletion', { id });
    
    // Simulate database operation with retry
    await withRetry(async () => {
      const { error } = await supabase
        .from('example_table')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
    });
    
    logger.info('Example deletion processed successfully', { id });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Your message has been deleted'
    });
  } catch (error) {
    // Log error with more context
    logger.error('Failed to process example deletion', error, { id });
    
    // Re-throw to let error middleware handle it
    throw error;
  }
}

/**
 * Validates request body against schema
 * @param req Request object
 * @returns Validated request body
 * @throws Validation error if body is invalid
 */
async function validateRequest(req: NextRequest): Promise<ValidatedRequest> {
  try {
    const body = await req.json();
    const result = requestSchema.safeParse(body);
    
    if (!result.success) {
      // Transform Zod validation errors to our format
      const validationErrors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      throw createValidationError('Validation failed', validationErrors);
    }
    
    return result.data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw createValidationError('Invalid JSON in request body');
    }
    
    throw error;
  }
}

// Export route handlers with error logging middleware
export const { GET, POST, PUT, DELETE } = withRouteErrorLogging({
  GET: handleGet,
  POST: handlePost,
  PUT: handlePut,
  DELETE: handleDelete
});