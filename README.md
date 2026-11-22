# SalonBook — Salon Appointment Booking Platform

SalonBook is a salon appointment booking platform where customers can explore salon services, book appointments, and manage their bookings. Administrators can manage services, customers, appointments, and payment information through an admin dashboard.

## Important Features

- User authentication and authorization
- Google sign-in
- Customer and admin dashboards
- Browse salon services
- Service details and pricing
- Appointment booking and management
- Appointment status tracking
- Online payment integration
- Payment history and status tracking
- Admin service management (create, update, and delete services)
- Service image upload from a device
- Image hosting through ImgBB
- Customer and appointment management
- Dashboard statistics
- Responsive UI for mobile, tablet, and desktop
- Toast notifications for user feedback
- Protected pages and role-based access

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Better Auth
- Stripe
- ImgBB
- REST API
- Vercel

## Installation Instructions

1. Clone the client repository:

   ```bash
   git clone YOUR_CLIENT_REPOSITORY_URL
   ```

2. Navigate to the project directory:

   ```bash
   cd salon-book-client
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env.local` file in the project root and add the required environment variables (names only are listed below).

5. Start the development server:

   ```bash
   npm run dev
   ```

## How to Run Locally

The frontend development server runs at:

**http://localhost:3000**

Run the following command:

```bash
npm run dev
```

To create a production build:

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

## Required Environment Variables

Add these variable names to `.env.local`. Do not commit secret values.

```env
NEXT_PUBLIC_API_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

> Check the actual project configuration and include any additional variables required by your implementation. Never publish secret values.

## Live Website

https://salon-book-client-wine.vercel.app/

## Client Repository

https://github.com/habibts/salonBook-client

## Server Repository

https://github.com/habibts/salonBook-server

