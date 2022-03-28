//const loadConfig = load(`.env.${process.env.NODE_ENV || "developement"}`)

export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT, 10) || 3030,
  },
  database: {
    mongodb: {
      host: process.env.MONGODB_ADDON_URI || process.env.DATABASE_MONGODB_HOST || "mongodb://localhost/nest",
    },
  },
});
