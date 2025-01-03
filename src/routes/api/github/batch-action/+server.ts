export async function POST({ request, cookies }) {
  const token = cookies.get('github_token');
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { action, repos } = await request.json();
    const failures = [];
    const successes = [];

    for (const repoId of repos) {
      try {
        // First, get the full repo details
        const repoResponse = await fetch(`https://api.github.com/repositories/${repoId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        });

        if (!repoResponse.ok) {
          throw new Error('Failed to fetch repository details');
        }

        const repoData = await repoResponse.json();
        const endpoint = `https://api.github.com/repos/${repoData.full_name}`;
        
        let method = 'PATCH';
        let body = {};

        if (action === 'delete') {
          method = 'DELETE';
        } else if (action === 'private') {
          body = { private: true };
        }

        const actionResponse = await fetch(endpoint, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: method === 'DELETE' ? undefined : JSON.stringify(body)
        });

        if (!actionResponse.ok) {
          throw new Error(`Failed to ${action} repository`);
        }

        successes.push(repoData.name);
      } catch (error) {
        console.error(`Error processing repo ${repoId}:`, error);
        failures.push(repoId);
      }
    }

    return new Response(JSON.stringify({ successes, failures }));
  } catch (error) {
    console.error('Error processing batch action:', error);
    return new Response('Failed to process batch action', { status: 500 });
  }
}
