import { rateLimit } from 'express-rate-limit';
import groqService from '@/lib/groqService';
import { userProfileService } from '@/lib/supabase';

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Helper to sanitize input
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/[^\w\s.,?!:;()'"]/g, ''); // Allow only safe characters
};

// Apply rate limiting to all requests
export const middleware = [limiter];

export async function POST(request: Request) {
  try {
    // Validate request
    if (!request.body) {
      return new Response(JSON.stringify({ error: 'Request body is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sanitize input
    const sanitizedMessage = sanitizeInput(body.message);
    
    // Get user profile if userId is provided
    let userProfile = null;
    if (body.userId) {
      userProfile = await userProfileService.getProfile(body.userId);
    } else {
      // If no userId provided, get the first profile (for demo purposes)
      const profiles = await userProfileService.getAllProfiles();
      if (profiles.length > 0) {
        userProfile = profiles[0];
      }
    }

    // Process conversation history
    let conversationHistory = body.conversationHistory || [];
    if (conversationHistory.length > 10) {
      // Limit conversation history to last 10 messages
      conversationHistory = conversationHistory.slice(-10);
    }

    // Generate response with retry logic
    let response = null;
    let retries = 0;
    const maxRetries = 3;

    while (!response && retries < maxRetries) {
      try {
        response = await groqService.generateNutritionResponse({
          message: sanitizedMessage,
          conversationHistory,
          userProfile,
        });
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      }
    }

    if (!response) {
      throw new Error('Failed to generate response after multiple attempts');
    }

    // Return successful response
    return Response.json({
      response,
      conversationId: body.conversationId || Date.now().toString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}