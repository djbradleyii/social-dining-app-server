module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: 'https://social-dining-app.now.sh/' || 'http://localhost:3000',
    //CLIENT_ORIGIN: 'http://localhost:3000',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dbradley:password@localhost/social-dining-app',
    TEST_DATABASE_URL:'postgresql://dbradley:password@localhost/social-dining-app-test',
    JWT_SECRET: process.env.JWT_SECRET || 'superdupersecretword',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '12h',
  }