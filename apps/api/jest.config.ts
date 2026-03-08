import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts", "tsx"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "./coverage",
  coverageReporters: ["text-summary", "json-summary", "lcov"],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 55,
      functions: 50,
      lines: 70,
    },
  },
  testEnvironment: "node",
};

export default config;
