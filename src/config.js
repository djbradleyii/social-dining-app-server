module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_ORIGIN: "https://social-dining-app-client.onrender.com",
  //CLIENT_ORIGIN: "http://localhost:3000",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://sd_admin:password@localhost/socialdining",
  TEST_DATABASE_URL:
    "postgresql://sd_admin:password@localhost/socialdining_test",
  JWT_SECRET: process.env.JWT_SECRET || "superdupersecretword",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "12h",
};
