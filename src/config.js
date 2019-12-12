module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
    DB_URL: process.env.DB_URL || 'postgresql://dbradley:password@localhost/social-dining-app',
    TEST_DB_URL:'postgresql://dbradley:password@localhost/social-dining-app-test'
  }