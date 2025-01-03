export async function POST({ cookies }) {
    cookies.delete('github_token', { path: '/' });
    cookies.delete('github_user', { path: '/' });
    
    return new Response(JSON.stringify({ success: true }));
  }
  