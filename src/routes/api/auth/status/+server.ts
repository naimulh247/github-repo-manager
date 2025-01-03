export async function GET({ cookies }) {
  const token = cookies.get('github_token');
  const userData = cookies.get('github_user');

  if (!token || !userData) {
    return new Response(JSON.stringify({
      authenticated: false
    }));
  }

  return new Response(JSON.stringify({
    authenticated: true,
    user: JSON.parse(userData)
  }));
}
