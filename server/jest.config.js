module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"], // or **/*.spec.js if you prefer
  moduleNameMapper: {
    "^@middlewares/(.*)$": "<rootDir>/middlewares/$1",
    "^@controllers/(.*)$": "<rootDir>/controllers/$1",
    "^@routes/(.*)$": "<rootDir>/routes/$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
