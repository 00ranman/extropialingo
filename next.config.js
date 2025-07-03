/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/learn',
        permanent: false,
      },
    ]
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3007',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'extropialingo-dev-secret-key',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/extropialingo',
    LEVELUP_API_URL: process.env.LEVELUP_API_URL || 'http://localhost:3004',
    XP_LEDGER_URL: process.env.XP_LEDGER_URL || 'http://localhost:3001',
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
    SIGNALFLOW_URL: process.env.SIGNALFLOW_URL || 'http://localhost:3003',
    HOMEFLOW_URL: process.env.HOMEFLOW_URL || 'http://localhost:3005',
  }
}

module.exports = nextConfig