
# AURADECOR.ai - AI Interior Design Marketplace

This repository contains the complete codebase for the AURADECOR.ai SaaS platform, a full-stack application built with React, FastAPI, and PostgreSQL.

## 1. Project Overview

AURADECOR.ai is a marketplace connecting property owners with design material suppliers.
- **Owners** can use an integrated AI tool to generate interior designs from floorplans, manage these designs as projects, and send material lists to local suppliers for quotes.
- **Suppliers** can create a public profile, list their services, and subscribe to receive project leads from owners in their city.

### Tech Stack
- **Frontend**: React, TypeScript, React Router, TailwindCSS
- **Backend**: FastAPI, Python, PostgreSQL
- **Database**: PostgreSQL with SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **Payments**: Stripe (Integration Ready)
- **Deployment**: Docker, Vercel (Frontend), Railway (Backend & DB)

## 2. Database Schema

The database schema is defined by the SQLAlchemy models in `backend/models.py`.

- **`User`**: Stores user information, including email, hashed password, and role (`owner` or `supplier`).
- **`SupplierProfile`**: Extends the `User` model for suppliers, holding company details, portfolio, location, and services.
- **`Project`**: Belongs to an owner and stores project details, including the floorplan and design analysis results.
- **`Subscription`**: Tracks user subscriptions (for both owners and suppliers) via Stripe.

## 3. Local Development Setup

### Prerequisites
- Docker and Docker Compose
- Python 3.9+ and Node.js 18+ (if not using Docker for frontend)
- A registered Google AI API Key

### Steps
1.  **Clone the Repository**:
    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```
2.  **Configure Environment Variables**:
    - Copy the `.env.example` file to a new file named `.env`.
    - Populate the `.env` file with your credentials:
      ```
      # This is a free, standard Gemini API Key
      FREE_GEMINI_KEY="YOUR_GOOGLE_AI_API_KEY"

      # Backend Configuration
      DATABASE_URL="postgresql+asyncpg://user:password@db:5432/auradecor"
      SECRET_KEY="a_very_secret_key_for_jwt_token_generation" # Generate a strong random string
      ALGORITHM="HS256"
      ACCESS_TOKEN_EXPIRE_MINUTES=30

      # Stripe API Keys
      STRIPE_SECRET_KEY="sk_test_..."
      STRIPE_WEBHOOK_SECRET="whsec_..."
      ```
3.  **Build and Run with Docker Compose**:
    - This is the recommended method as it sets up the backend, database, and serves the frontend.
    ```bash
    docker-compose up --build
    ```
4.  **Access the Application**:
    - **SaaS Platform (Frontend)**: `http://localhost:5173`
    - **AI Studio Tool**: `http://localhost:5173/ai-studio/index.html`
    - **Backend API Docs**: `http://localhost:8000/docs`

## 4. Admin User Setup

The first user registered in the system will not automatically be an admin. To create an admin user, you need to set their role directly in the database.

1.  **Register a new user** through the application's signup form.
2.  **Connect to the PostgreSQL database**. If using Docker, you can connect to the running container.
3.  **Update the user's role**:
    ```sql
    UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
    ```
    *(Note: The `role` enum in the final implementation may differ; this is a conceptual guide).*

## 5. Deployment

### Frontend (Vercel)
1.  Connect your Git repository to Vercel.
2.  Configure the build settings:
    - **Build Command**: `npm install && npm run build` (or equivalent for your setup)
    - **Output Directory**: `dist`
3.  Add your backend API URL as an environment variable: `VITE_API_BASE_URL=https://your-railway-backend-url.up.railway.app`.

### Backend & Database (Railway)
1.  Create a new project on Railway and add a PostgreSQL database service.
2.  Connect your Git repository. Railway will detect the `Dockerfile` and set up the backend service.
3.  Configure the environment variables in the Railway service settings, copying the values from your local `.env` file.
    - `DATABASE_URL` will be provided by the Railway PostgreSQL service.
    - Ensure your `SECRET_KEY` is a strong, randomly generated key.
4.  Enable a public domain for your backend service.

---
