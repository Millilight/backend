import * as dotenv from 'dotenv-flow';

export default () => {
  dotenv.config({ silent: true });
  return {
    node_env: process.env.NODE_ENV || 'development',
    app: {
      port: parseInt(process.env.APP_PORT, 10) || 3030,
    },
    product_name: process.env.PRODUCT_NAME || 'amuni',
    base_urls: {
      home: process.env.HOME_URL || 'https://amuni.fr',
      front:
        process.env.FRONT_URL ||
        'http://localhost:3000/',
    },
    database: {
      mongodb: {
        port: parseInt(process.env.MONGODB_ADDON_PORT, 10) || parseInt(process.env.DATABASE_MONGODB_PORT, 10),
        uri:
          process.env.MONGODB_ADDON_URI ||
          process.env.DATABASE_MONGODB_URI ||
          'mongodb://localhost/nest',
      },
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiration: process.env.JWT_EXPIRATION || '30 days',
    },
    smtp: {
      host: process.env.SMTP_HOST || 'smtp-relay.sendinblue.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || 'noreply@example.com',
    },
  };
};
