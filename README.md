📌 Backend Developer (Intern) Assignment: Scalable REST API & RBAC
Project Overview
This project implements a secure, scalable RESTful API with Authentication, Role-Based Access Control (RBAC), and CRUD functionality. It fulfills the assignment requirements using a modern, serverless-style architecture powered by Supabase, eliminating the need for a dedicated, custom API server.

Feature	Status	Implementation Detail
Backend Technology	✅	Supabase (PostgreSQL Database, Auth, PostgREST API)
Authentication	✅	JWT via Supabase Auth (Password Hashing, Secure Token Handling)
Authorization	✅	Role-Based Access Control via PostgreSQL Row Level Security (RLS)
CRUD API	✅	Entity: Tasks
Frontend UI	✅	Next.js/React (Styled with CSS-in-JS for a clean dark theme)
API Versioning	✅	Automatic /rest/v1/ prefix via PostgREST
🚀 Getting Started
Follow these steps to clone the project and run it locally.

1. Prerequisites
Node.js (v18+) & npm

A Supabase Project (with the schema and policies defined)

2. Setup and Installation
Clone the Repository:

Bash

git clone <YOUR_GITHUB_REPO_URL>
cd <project-folder>/task-app
Install Dependencies:

Bash

npm install
Configure Environment Variables:
Create a file named .env in the task-app/ root directory and add your Supabase credentials:

Code snippet

# .env
NEXT_PUBLIC_SUPABASE_URL="YOUR_PROJECT_URL_HERE"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY_HERE"
Run the Development Server:

Bash

npm run dev
The application will be accessible at http://localhost:3000.

🔐 Backend Architecture and Scalability
The core backend focus was to design a system that is both highly secure and inherently scalable. This was achieved by leveraging Supabase's managed services.

1. Stateless Authentication (Scalability)
Technology: Supabase Auth generates a JSON Web Token (JWT) upon login.

Scalability Benefit: All API calls are stateless. The request carries the user's identity and claims (like the role) within the signed JWT. This eliminates the need for session storage on the server, allowing the API layer (PostgREST) to be easily replicated and scaled horizontally behind a load balancer.

2. Role-Based Authorization (RLS)
Technology: Authorization is managed by PostgreSQL's Row Level Security (RLS).

Security Benefit: RLS policies are enforced directly by the database engine before any data is returned. This is the strongest form of access control, as it cannot be bypassed by buggy application code or unauthorized API calls.

3. API Design and Versioning
The CRUD API adheres to REST principles using standard HTTP methods (GET, POST, PATCH, DELETE).

API Versioning: The database layer is exposed at the base path /rest/v1/tasks, fulfilling the versioning requirement.

👩‍💻 Role-Based Access Control (RBAC) Demonstration
Access to the tasks entity is strictly controlled by RLS policies based on the user's role, which is stored as a custom claim ("role": "...") in the JWT.

Operation	Target Role	RLS Policy Used	Permission Level
CREATE (INSERT)	User / Admin	WITH CHECK (user_id = auth.uid())	User: Can only create tasks tied to their ID.
READ (SELECT)	User	USING (user_id = auth.uid())	User: Can only see their own tasks.
READ (SELECT)	Admin	USING (role = 'admin')	Admin: Can see ALL tasks (global view).
UPDATE (PATCH)	User / Admin	USING (user_id = auth.uid())	User: Can only update their own tasks (e.g., set complete).
DELETE	Admin	USING (role = 'admin')	Admin Only: Can delete any task in the database.
📝 API Documentation
The REST API is automatically documented via Supabase's PostgREST layer.

Key API Endpoint:
Base URL: https://<project-ref>.supabase.co/rest/v1/

Tasks CRUD: GET /rest/v1/tasks (Supports filtering, ordering, and RLS rules)

Authentication: Handled by the /auth/v1/ endpoints.

⚙️ Database Schema
The core entity is the public.tasks table, defined with the following schema:

SQL

CREATE TABLE public.tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NULL,
    is_complete boolean NOT NULL DEFAULT false,
    -- Foreign Key enforcing data ownership
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT tasks_pkey PRIMARY KEY (id)
);
-- RLS MUST BE ENABLED for security
ALTER TABLE public.tas


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
