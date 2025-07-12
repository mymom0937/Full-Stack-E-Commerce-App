import { getAuth } from '@clerk/nextjs/server';

export const verifyAuth = async (request) => {
  // Use getAuth with the request parameter
  const { userId } = getAuth(request);
  
  if (!userId) {
    return { error: 'Unauthorized: Please sign in to continue', userId: null };
  }
  
  return { userId, error: null };
}; 