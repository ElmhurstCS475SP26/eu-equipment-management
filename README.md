# EU Equipment Management Web App

## Description

The EU Equipment Management web application manages and tracks equipment for the Elmhurst University CS 475 class. It allows students and faculty to view, request, and reserve equipment necessary for academic projects. The goal of the application is to streamline the equipment management process, making it easier for users to access resources.

## Tech Stack
- **Framework**: Next.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS + shadcn/ui components
- **Email**: Resend
- **Deployment**: Vercel

## Project Structure

```
├── src/                    # Application source code
├── app/                    # Next.js app directory (pages and routes)
├── components/             # Reusable React components
├── types/                  # TypeScript type definitions
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
└── package.json            # Project dependencies
```

## Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ElmhurstCS475SP26/eu-equipment-management.git
   cd eu-equipment-management
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env.local`
   - Fill in the required environment variables:
     - `DATABASE_URL` - Your PostgreSQL database connection string
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
     - `CLERK_SECRET_KEY` - Clerk secret key
     - `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL (if applicable)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase key (if applicable)
     - `RESEND_API_KEY` - Resend API key for email functionality

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**: Navigate to `http://localhost:3000` to view the application.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Learn More

For more information about the technologies used in this project:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss improvements or features.