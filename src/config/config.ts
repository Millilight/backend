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
});
