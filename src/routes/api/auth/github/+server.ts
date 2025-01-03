import { GITHUB_CLIENT_ID } from '$env/static/private';
import { PUBLIC_URL } from '$env/static/public';

export async function GET() {
  console.log(PUBLIC_URL)
  const state = crypto.randomUUID();
  
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: PUBLIC_URL + '/api/auth/callback',
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
