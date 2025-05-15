# DockerHelper

![DockerHelper Logo](/public/android-chrome-192x192.png)

DockerHelper is an AI-powered web application that automatically analyzes Git repositories and generates optimized Docker configurations. It simplifies the containerization process by providing tailored Dockerfile and docker-compose.yaml files for your projects.

## 🚀 Features

- **AI-Powered Analysis**: Automatically analyze Git repositories to understand their structure, dependencies, and requirements
- **Dockerfile Generation**: Generate optimized Dockerfiles tailored to your specific project
- **Docker Compose Generation**: Create docker-compose.yaml files for multi-service applications
- **Configuration Management**: Save, view, and manage your Docker configurations
- **Version History**: Track changes to your configurations with full version history
- **Improvement Feedback Loop**: Mark configurations as successful or provide feedback to improve them
- **OAuth Authentication**: Secure login via Email/Password, GitHub, or Google
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Choose your preferred visual theme

## 🔧 Tech Stack

- **Frontend**:
  - Next.js (App Router)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - Lucide React icons

- **Backend**:
  - FastAPI
  - PostgreSQL
  - SQLAlchemy
  - LLM integration for AI analysis
  - JWT authentication

## 📋 Architecture

DockerHelper follows a client-server architecture:

1. **Frontend**: A Next.js application that provides the user interface
2. **Backend API**: A FastAPI application that handles authentication, repository analysis, and Docker configuration generation
3. **Database**: PostgreSQL for storing user data, analysis results, and configurations
4. **AI Service**: Integration with LLMs for analyzing repositories and generating Docker configurations

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bayurzx/dockerhelper.git
   cd dockerhelper
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file based on `.env.example`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_OAUTH_CALLBACK_URL=http://localhost:3000/oauth-callback
   NEXT_PUBLIC_ENABLE_GITHUB_LOGIN=true
   NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=true
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔍 Usage Guide

### Analyzing a Repository

1. Navigate to the "Repositories" page
2. Enter a Git repository URL and optional branch name
3. Click "Analyze Repository"
4. Review the analysis results
5. Click "Generate Dockerfile" to create a Dockerfile

### Generating a Docker Compose File

1. Navigate to the "Compose Generator" page
2. Select previously analyzed repositories to include as services
3. Configure service names and settings
4. Click "Generate Compose File"
5. Review and save the generated docker-compose.yaml

### Managing Configurations

1. Navigate to the "Configurations" page to see all your saved configurations
2. Click on a configuration to view its details
3. Use the "Mark as Successful" button to provide positive feedback
4. Use the "Improve Configuration" button to request improvements
5. View version history to track changes and revert if needed

## 📚 API Documentation

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login with email and password
- `GET /api/v1/auth/github` - Initiate GitHub OAuth flow
- `GET /api/v1/auth/google` - Initiate Google OAuth flow

### Repository Analysis

- `POST /api/v1/repos/analyze` - Analyze a Git repository

### Docker Configuration

- `POST /api/v1/docker/generate/dockerfile` - Generate a Dockerfile
- `POST /api/v1/docker/generate/compose` - Generate a docker-compose.yaml file
- `GET /api/v1/docker/configs` - List all configurations
- `GET /api/v1/docker/configs/:id` - Get configuration details
- `PATCH /api/v1/docker/configs/:id` - Update configuration
- `DELETE /api/v1/docker/configs/:id` - Delete configuration
- `POST /api/v1/docker/configs/:id/mark_successful` - Mark configuration as successful
- `POST /api/v1/docker/configs/:id/improve` - Request configuration improvement

### Version Management

- `GET /api/v1/docker/configs/:id/versions` - List all versions of a configuration
- `GET /api/v1/docker/configs/:id/versions/:version_number` - Get specific version
- `POST /api/v1/docker/configs/:id/versions/:version_number/revert` - Revert to a specific version

## 📁 Project Structure

```
.
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── compose-generator/
│   │   ├── configurations/
│   │   ├── login/
│   │   ├── oauth-callback/
│   │   ├── register/
│   │   ├── repositories/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/          # React components
│   │   ├── ui/              # UI components (shadcn/ui)
│   │   ├── analysis-results.tsx
│   │   ├── code-display.tsx
│   │   ├── compose-generator-form.tsx
│   │   ├── configurations-list.tsx
│   │   ├── footer.tsx
│   │   ├── header.tsx
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── repository-form.tsx
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and context
│   ├── styles/              # Global styles
│   └── types/               # TypeScript type definitions
├── .env.example             # Example environment variables
├── .env.local               # Local environment variables (git-ignored)
├── next.config.js           # Next.js configuration
├── package.json             # Project dependencies
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [PostgreSQL](https://www.postgresql.org/)

## 📞 Contact

For questions or support, please open an issue on the GitHub repository or contact the maintainers directly.

---

Built with ❤️ by the DockerHelper Team
