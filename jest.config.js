module.exports = {
    testEnvironment: "node",
    displayName: {
        name: "blockr-validator",
        color: "blue"
    },
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    testMatch: [
        "**/__tests__/**/*.test.+(ts|tsx)"
    ],
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/index.ts",
        "!src/main.ts",
        "!src/injection/**/*",
        "!src/__tests__/**/*"
    ],
    reporters: [
        "default",
        "jest-junit"
    ],
    coverageReporters: [
        "text",
        "lcov",
        "cobertura"
    ]
}