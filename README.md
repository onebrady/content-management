# Content Management Tool

A secure, role-based content management tool with Microsoft Azure AD authentication, approval workflows, and modern UI.

## Features

- **Authentication**: Microsoft Azure AD integration via NextAuth.js
- **Role-Based Access Control**: VIEWER, CONTRIBUTOR, MODERATOR, ADMIN roles
- **Content Management**: Rich text editing with Tiptap
- **Approval Workflows**: Multi-stage approval with email notifications
- **File Uploads**: Secure file handling with UploadThing
- **Modern UI**: Material-UI v6 with TailwindCSS

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Material-UI v6, TailwindCSS
- **Backend**: NextAuth.js v4, Prisma ORM, PostgreSQL
- **File Storage**: UploadThing
- **Email**: Resend with React Email templates
- **Deployment**: Vercel with GitHub Actions CI/CD

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── lib/                    # Utilities and configurations
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── styles/                 # Global styles
```

## Development

- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting with Next.js rules
- **Prettier**: Code formatting
- **TailwindCSS**: Utility-first CSS framework

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL=""

# Authentication
NEXTAUTH_URL=""
NEXTAUTH_SECRET=""
AZURE_AD_CLIENT_ID=""
AZURE_AD_CLIENT_SECRET=""
AZURE_AD_TENANT_ID=""

# File Upload
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""

# Email
RESEND_API_KEY=""

# App
NEXT_PUBLIC_APP_URL=""
```

## License

MIT 