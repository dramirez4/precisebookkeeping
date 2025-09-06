# Precision Bookkeeping Platform

A modern, automated bookkeeping platform built for small to medium businesses. Combines accounting expertise with cutting-edge technology to deliver professional bookkeeping services.

## 🚀 Features

### Core Functionality

- **Automated Transaction Processing**: Bank feed integration with automatic categorization
- **QuickBooks Integration**: Seamless sync with QuickBooks Online
- **Client Portal**: Secure dashboard for document uploads and financial reports
- **Real-time Reporting**: Automated P&L, Balance Sheet, and Cash Flow reports
- **Document Management**: OCR processing and secure file storage
- **Multi-client Support**: Manage multiple clients from one platform

### Automation Features

- **Bank Reconciliation**: Automated matching and reconciliation
- **Transaction Categorization**: AI-powered expense categorization
- **Report Generation**: Automated monthly financial reports
- **Invoice Processing**: Automated invoice creation and tracking
- **Receipt Processing**: OCR extraction from receipts and invoices

## 🛠️ Tech Stack

### Backend

- **Node.js** with Express.js
- **PostgreSQL** database with Sequelize ORM
- **JWT** authentication
- **AWS S3** for document storage
- **Redis** for job queues
- **QuickBooks Online API** integration
- **Plaid API** for bank connections

### Frontend

- **Next.js** with React
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **React Hook Form** for forms
- **Recharts** for data visualization

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis (optional, for job queues)
- AWS S3 bucket (for document storage)
- QuickBooks Developer Account
- Plaid Developer Account (for bank connections)

## 🚀 Quick Start

1. **Clone and setup**:

   ```bash
   git clone <your-repo>
   cd bookkeep
   ./setup.sh
   ```

2. **Configure environment**:

   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Create database**:

   ```sql
   CREATE DATABASE precision_bookkeeping;
   ```

4. **Start development**:

   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Client Portal: http://localhost:3000
   - API: http://localhost:3001

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=precision_bookkeeping
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=precision-bookkeeping-documents

# QuickBooks
QB_CLIENT_ID=your_quickbooks_client_id
QB_CLIENT_SECRET=your_quickbooks_client_secret

# Plaid (Bank Connections)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
```

## 📁 Project Structure

```
bookkeep/
├── server/                 # Backend API
│   ├── config/            # Database configuration
│   ├── middleware/        # Auth, error handling
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── index.js          # Server entry point
├── client/               # Frontend React app
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── pages/           # Next.js pages
│   ├── services/        # API services
│   └── styles/          # CSS styles
├── main.html            # Marketing website
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Clients

- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get client details
- `PUT /api/clients/:id` - Update client

### QuickBooks

- `GET /api/quickbooks/auth-url` - Get OAuth URL
- `POST /api/quickbooks/callback` - Handle OAuth callback
- `POST /api/quickbooks/sync-transactions/:clientId` - Sync transactions

### Reports

- `POST /api/reports/profit-loss/:clientId` - Generate P&L report
- `POST /api/reports/balance-sheet/:clientId` - Generate Balance Sheet
- `POST /api/reports/cash-flow/:clientId` - Generate Cash Flow report

### Documents

- `POST /api/documents/:clientId/upload` - Upload document
- `GET /api/documents/:clientId` - List client documents
- `GET /api/documents/:clientId/:id/download` - Download document

## 🚀 Deployment

### Production Setup

1. **Database**: Set up PostgreSQL on your server
2. **Environment**: Configure production environment variables
3. **Build**: `npm run build`
4. **Start**: `npm start`

### Docker (Optional)

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- Secure file uploads
- Encrypted document storage

## 📊 Monitoring & Logging

- Winston logging system
- Error tracking
- Performance monitoring
- Health check endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, email: contact@precisionbookkeeping.com

---

**Built with ❤️ for modern bookkeeping**
