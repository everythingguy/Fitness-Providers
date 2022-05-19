/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  verbose: true,
  modulePathIgnorePatterns: ["client", "dist", "node_modules", "mongodb_data"],
  setupFiles: ["dotenv/config"],
  testTimeout: 10000,
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!**/node_modules/**"],
  coverageReporters: ["text", "cobertura", "clover", "json", "lcov"],
  coverageDirectory: "coverage",
  reporters: ["default", "jest-junit"],
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "d.ts"],
};
