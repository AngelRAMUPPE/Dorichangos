import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'MONGODB_URI',
  'MONGODB_PROD_URI',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'EMAIL_USER',
  'EMAIL_PASS'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Falta la variable de entorno requerida: ${envVar}`);
  }
});

export default {
  mongodb: {
    uri: process.env.MONGODB_URI,
    prodUri: process.env.MONGODB_PROD_URI
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  },
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};
