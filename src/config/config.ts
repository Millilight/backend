export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT, 10) || 3030,
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
