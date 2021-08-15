/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["client", "dist"],
  setupFiles: ["dotenv/config"],
  testTimeout: 10000,
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
  coverageDirectory: "coverage",
};
