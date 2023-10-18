const { DATABASE_URL } = require("./src/config");

// Update with your config settings.

module.exports = {
  development: {
    client: "pg",
    connection: DATABASE_URL,
    pool: {
      min: 2,
      max: 10, // Adjust this value
    },
  },
};
