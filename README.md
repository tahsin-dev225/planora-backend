# Planora - Event Management Backend

Planora is a robust and scalable Event Management Backend designed to handle everything from user authentication to complex event registrations and secure payments. Built with **Express**, **Prisma**, and **TypeScript**, it provides a solid foundation for modern event management platforms.

## 🚀 Features

- **Authentication & Authorization**: 
  - Secure identity management using **Better-Auth**.
  - Supports Email/Password and **Google OAuth** social login.
  - Role-based access control (Admin, Organizer, Participant).
- **Event Management**: 
  - Full CRUD operations for event organizers.
  - Image uploads and optimizations via **Cloudinary**.
  - Categorization and search functionality.
- **Participant Registration**: 
  - Public and private event registration flows.
  - Real-time attendee tracking.
- **Payment Integration**: 
  - Seamless, secure payment processing via **Stripe**.
  - Webhook integration for real-time payment status updates.
- **Review & Rating System**: 
  - Post-event feedback mechanism for participants.
  - High-performance data aggregation for event ratings.
- **Email Notifications**: 
  - Automated event confirmations and payment receipts using **Nodemailer**.
- **Real-time Statistics**: 
  - Dashboard-ready endpoints for monitoring platform growth and engagement.
- **Modular Architecture**: 
  - Clean, organized code with a modular Prisma schema for enterprise-grade maintainability.

## 🛠️ Tech Stack

- **Framework**: Express.js (v5.2.1)
- **Language**: TypeScript
- **ORM**: Prisma (with PostgreSQL)
- **Authentication**: Better-Auth
- **Payments**: Stripe
- **File Storage**: Cloudinary
- **Emails**: Nodemailer
- **Validation**: Zod
- **API Documentation**: [RESTful Architecture]

## 📥 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database
- Stripe Account (for payments)
- Cloudinary Account (for image uploads)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tahsin-dev225/planora-backend.git
   cd planora-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and populate it based on the section below.

4. **Initialize the database:**
   ```bash
   npm run generate
   npm run migrate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔐 Environment Variables

Ensure your `.env` contains the following keys:

| Variable | Description |
| :--- | :--- |
| `PORT` | Server port (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret for Better-Auth |
| `BETTER_AUTH_URL` | Base URL for authentication |
| `ACCESS_TOKEN_SECRET` | JWT Access Token secret |
| `REFRESH_TOKEN_SECRET` | JWT Refresh Token secret |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET`| Stripe webhook secret |
| `EMAIL_SENDER_SMTP_USER`| SMTP user for emails |
| `EMAIL_SENDER_SMTP_PASS`| SMTP password for emails |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

## 📜 Available Scripts

- `npm run dev`: Start development server with hot-reloading.
- `npm run build`: Compile TypeScript to JavaScript.
- `npm start`: Run the production build.
- `npm run migrate`: Run Prisma migrations.
- `npm run generate`: Generate Prisma client.
- `npm run studio`: Open Prisma Studio to explore your data.
- `npm run stripe:webhook`: Start Stripe CLI to listen for webhooks locally.

## 📂 Project Structure

```text
src/
├── app/
│   ├── interface/      # Global interfaces
│   ├── lib/            # Library configurations (auth, prisma, stripe)
│   ├── midlewere/      # Global middlewares (error handlers, auth guards)
│   ├── module/         # Feature modules (auth, event, payment, etc.)
│   ├── routes/         # Unified API routing
│   └── utils/          # Helper functions and utilities
├── config/             # Environment and global configurations
└── server.ts           # Application entry point
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the [ISC License](LICENSE).
