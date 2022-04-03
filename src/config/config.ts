export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT, 10) || 3030,
  },
  product_name: process.env.PRODUCT_NAME || "FEE",
  base_urls: {
    home: process.env.HOME_URL || "https://fee.fr",
    front: process.env.FRONT_URL || "https://app-d3b2a175-fbac-4d7f-9856-5d80eb33e84d.cleverapps.io",
  },
  database: {
    mongodb: {
      uri:
        process.env.MONGODB_ADDON_URI ||
        process.env.DATABASE_MONGODB_URI ||
        "mongodb://localhost/nest",
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION || "30 days",
  },
  smtp: {
    host: process.env.SMTP_HOST || "smtp-relay.sendinblue.com",
    port: parseInt(process.env.SMTP_PORT, 10) || 583,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || "noreply@example.com"
  }
});
