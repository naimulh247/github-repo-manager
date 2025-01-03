// src/routes/api/github/repos/+server.js
import { json } from '@sveltejs/kit';

export async function GET({ cookies }) {
    const token = cookies.get('github_token');
    
    if (!token) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }

        const repos = await response.json();
        
        const repoDetails = await Promise.all(
            repos.map(async (repo) => {
                try {
                    // Get the last commit for each repo
                    const commitsUrl = `https://api.github.com/repos/${repo.full_name}/commits?per_page=1`;
                    const commitsResponse = await fetch(commitsUrl, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/vnd.github.v3+json'
                        }
                    });
                    
                    let lastCommit = null;
                    if (commitsResponse.ok) {
                        const commits = await commitsResponse.json();
                        if (commits && commits.length > 0) {
                            lastCommit = {
                                sha: commits[0].sha,
                                message: commits[0].commit.message,
                                author: commits[0].commit.author.name,
                                date: commits[0].commit.author.date
                            };
                        }
                    }

                    return {
                        id: repo.id,
                        name: repo.name,
                        full_name: repo.full_name,
                        private: repo.private,
                        html_url: repo.html_url,
                        fork: repo.fork,
                        // Stats
                        stargazers_count: repo.stargazers_count,
                        watchers_count: repo.watchers_count,
                        forks_count: repo.forks_count,
                        open_issues_count: repo.open_issues_count,
                        // Additional info
                        language: repo.language,
                        default_branch: repo.default_branch,
                        created_at: repo.created_at,
                        updated_at: repo.updated_at,
                        pushed_at: repo.pushed_at,
                        size: repo.size,
                        last_commit: lastCommit
                    };
                } catch (error) {
                    console.error(`Error fetching details for ${repo.full_name}:`, error);
                    // Return basic repo info if additional details fetch fails
                    return {
                        id: repo.id,
                        name: repo.name,
                        full_name: repo.full_name,
                        private: repo.private,
                        html_url: repo.html_url,
                        fork: repo.fork
                    };
                }
            })
        );

        return json(repoDetails);
    } catch (error) {
        console.error('Error fetching repos:', error);
        return new Response('Failed to fetch repositories', { 
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}