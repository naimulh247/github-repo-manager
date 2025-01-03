import { GITHUB_CLIENT_ID } from '$env/static/private';

export async function GET() {
  const state = crypto.randomUUID();
  
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: 'http://localhost:5173/api/auth/callback',
    scope: 'repo delete_repo',
    state
  });

  // Store state in session for CSRF protection
  const headers = new Headers();
  headers.append('Set-Cookie', `github_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax`);
  headers.append('Location', `https://github.com/login/oauth/authorize?${params.toString()}`);

  return new Response(null, {
    status: 302,
    headers
  });
}
