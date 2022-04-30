/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  verbose: true,
  modulePathIgnorePatterns: ["dist"],
  setupFiles: ["dotenv/config"],
  testTimeout: 10000,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!**/node_modules/**",
    "!cypress/**",
  ],
  coverageReporters: ["text", "cobertura", "clover", "json", "lcov"],
  coverageDirectory: "coverage",
  reporters: ["default", "jest-junit"],
};