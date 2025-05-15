// File: /app/api/example-with-error-handler/route.ts
import { NextRequest } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { withRouteErrorHandlers, validateRequest, ensureAuthenticated } from "@/lib/middlewares/error-handler";
import { apiResponse } from "@/lib/utils/api-utils";
import { 
  ErrorCategory, 
  ErrorCode, 
  createApiError, 
  createValidationError,
  handleSupabaseError
} from "@/lib/utils/error-utils";
import { Database } from "@/types/supabase";
import { z } from "zod";

/**
 * Validation schema for the request body
 */
const exampleSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().optional(),
});

/**
 * Validates the request body against the schema
 * @param data The data to validate
 * @returns Validation result
 */
function validateExample(data: unknown) {
  const result = exampleSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join("."),
      message: err.message,
    }));
    
    return {
      valid: false,
      errors,
    };
  }
  
  return { valid: true };
}

/**
 * Example GET handler with error handling
 * @param request The request object
 * @returns Response with data or error
 */
async function handleGet(request: NextRequest) {
  // Check authentication
  const authError = await ensureAuthenticated(request);
  if (authError) {
    return authError;
  }
  
  // Get query parameters
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  
  // Validate required parameters
  if (!id) {
    throw createValidationError("Missing required parameter", [
      { field: "id", message: "ID is required" },
    ]);
  }
  
  // Get Supabase client
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    // Fetch data from database
    const { data, error } = await supabase
      .from("examples")
      .select("*")
      .eq("id", id)
      .single();
    
    // Handle database errors
    if (error) {
      throw handleSupabaseError(error);
    }
    
    // Handle not found
    if (!data) {
      throw createApiError({
        message: `Example with ID ${id} not found`,
        category: ErrorCategory.NOT_FOUND,
        code: ErrorCode.NOT_FOUND_RESOURCE,
      });
    }
    
    // Return success response
    return apiResponse(data);
  } catch (error) {
    // The error will be handled by the error handling middleware
    throw error;
  }
}

/**
 * Example POST handler with error handling
 * @param request The request object
 * @returns Response with data or error
 */
async function handlePost(request: NextRequest) {
  // Check authentication
  const authError = await ensureAuthenticated(request);
  if (authError) {
    return authError;
  }
  
  // Validate request body
  const { validatedData, response } = await validateRequest(request, validateExample);
  if (response) {
    return response;
  }
  
  // Get Supabase client
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw createApiError({
        message: "User not found",
        category: ErrorCategory.AUTH,
        code: ErrorCode.AUTH_NOT_AUTHENTICATED,
      });
    }
    
    // Insert data into database
    const { data, error } = await supabase
      .from("examples")
      .insert({
        user_id: user.id,
        name: validatedData.name,
        email: validatedData.email,
        message: validatedData.message || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    // Handle database errors
    if (error) {
      throw handleSupabaseError(error);
    }
    
    // Return success response
    return apiResponse(data, 201);
  } catch (error) {
    // The error will be handled by the error handling middleware
    throw error;
  }
}

/**
 * Example PUT handler with error handling
 * @param request The request object
 * @returns Response with data or error
 */
async function handlePut(request: NextRequest) {
  // Check authentication
  const authError = await ensureAuthenticated(request);
  if (authError) {
    return authError;
  }
  
  // Validate request body
  const { validatedData, response } = await validateRequest(request, validateExample);
  if (response) {
    return response;
  }
  
  // Get query parameters
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  
  // Validate required parameters
  if (!id) {
    throw createValidationError("Missing required parameter", [
      { field: "id", message: "ID is required" },
    ]);
  }
  
  // Get Supabase client
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw createApiError({
        message: "User not found",
        category: ErrorCategory.AUTH,
        code: ErrorCode.AUTH_NOT_AUTHENTICATED,
      });
    }
    
    // Check if the example exists and belongs to the user
    const { data: existingExample, error: checkError } = await supabase
      .from("examples")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    
    if (checkError) {
      throw handleSupabaseError(checkError);
    }
    
    if (!existingExample) {
      throw createApiError({
        message: `Example with ID ${id} not found or you don't have permission to update it`,
        category: ErrorCategory.PERMISSION,
        code: ErrorCode.PERMISSION_DENIED,
      });
    }
    
    // Update data in database
    const { data, error } = await supabase
      .from("examples")
      .update({
        name: validatedData.name,
        email: validatedData.email,
        message: validatedData.message || existingExample.message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    
    // Handle database errors
    if (error) {
      throw handleSupabaseError(error);
    }
    
    // Return success response
    return apiResponse(data);
  } catch (error) {
    // The error will be handled by the error handling middleware
    throw error;
  }
}

/**
 * Example DELETE handler with error handling
 * @param request The request object
 * @returns Response with success or error
 */
async function handleDelete(request: NextRequest) {
  // Check authentication
  const authError = await ensureAuthenticated(request);
  if (authError) {
    return authError;
  }
  
  // Get query parameters
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  
  // Validate required parameters
  if (!id) {
    throw createValidationError("Missing required parameter", [
      { field: "id", message: "ID is required" },
    ]);
  }
  
  // Get Supabase client
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw createApiError({
        message: "User not found",
        category: ErrorCategory.AUTH,
        code: ErrorCode.AUTH_NOT_AUTHENTICATED,
      });
    }
    
    // Check if the example exists and belongs to the user
    const { data: existingExample, error: checkError } = await supabase
      .from("examples")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    
    if (checkError) {
      throw handleSupabaseError(checkError);
    }
    
    if (!existingExample) {
      throw createApiError({
        message: `Example with ID ${id} not found or you don't have permission to delete it`,
        category: ErrorCategory.PERMISSION,
        code: ErrorCode.PERMISSION_DENIED,
      });
    }
    
    // Delete data from database
    const { error } = await supabase
      .from("examples")
      .delete()
      .eq("id", id);
    
    // Handle database errors
    if (error) {
      throw handleSupabaseError(error);
    }
    
    // Return success response
    return apiResponse({ success: true, message: "Example deleted successfully" });
  } catch (error) {
    // The error will be handled by the error handling middleware
    throw error;
  }
}

// Export route handlers with error handling
export const { GET, POST, PUT, DELETE } = withRouteErrorHandlers({
  GET: handleGet,
  POST: handlePost,
  PUT: handlePut,
  DELETE: handleDelete,
});