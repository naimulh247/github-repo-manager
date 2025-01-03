# GitHub Repo Manager

A SvelteKit application that helps you manage multiple GitHub repositories at once. View repository stats, batch update privacy settings, and delete repositories with ease.

## Features

- 🔐 OAuth authentication with GitHub
- 📊 View repository statistics
  - Stars and forks
  - Last commit information
  - Programming language
- 🔍 Filter repositories by:
  - Visibility (Public/Private)
  - Type (Source/Forked)
- 📝 Batch actions:
  - Make repositories private
  - Delete repositories
- 📈 Real-time repository stats
- 🎨  UI with Tailwind CSS

## Prerequisites

- Node.js
- A GitHub account
- A GitHub OAuth App (for authentication)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/naimulh247/github-repo-manager.git
cd github-repo-manager
```

2. Install dependencies:
```bash
pnpm install
```

3. Register a new OAuth application in GitHub:
   - Go to GitHub Settings > Developer Settings > OAuth Apps > New OAuth App
   - Set Homepage URL to `http://localhost:5173`
   - Set Authorization callback URL to `http://localhost:5173/api/auth/callback`
   - Copy the Client ID and Client Secret

4. Create a `.env` file in the project root:
```env
GITHUB_CLIENT_ID="your_client_id_here"
GITHUB_CLIENT_SECRET="your_client_secret_here"
PUBLIC_URL="http://localhost:5173"
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Project Structure

```
github-repo-manager/
├── src/
│   ├── routes/
│   │   ├── +page.svelte           # Main application page
│   │   └── api/                   # API endpoints
│   │       ├── auth/              # Authentication endpoints
│   │       │   ├── github/        # GitHub OAuth initiation
│   │       │   ├── callback/      # OAuth callback handling
│   │       │   ├── status/        # Session status
│   │       │   └── logout/        # Logout handling
│   │       └── github/
│   │           ├── repos/         # Repository management
│   │           └── batch-action/  # Batch operations
│   ├── app.html                   # Base HTML template
│   └── app.css                    # Global styles
├── static/                        # Static assets
├── .env                          # Environment variables
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── vite.config.js
```


## API Endpoints

### Authentication
- `GET /api/auth/github` - Initiates GitHub OAuth flow
- `GET /api/auth/callback` - Handles OAuth callback
- `GET /api/auth/status` - Checks authentication status
- `POST /api/auth/logout` - Logs out user

### GitHub Operations
- `GET /api/github/repos` - Fetches user's repositories with stats
- `POST /api/github/batch-action` - Performs batch operations on repositories

## Development

### Building

```bash
pnpm build
```

### Production Preview

```bash
pnpm preview
```

### Deployment

This application can be deployed to any platform that supports Node.js. Make sure to:
1. Set up the environment variables
2. Update the OAuth callback URL in your GitHub OAuth App settings
3. Configure CORS if needed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- GitHub API v3