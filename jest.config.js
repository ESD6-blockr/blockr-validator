module.exports = {
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    testMatch: [
        "**/__tests__/**/*.test.+(ts|tsx)"
    ],
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.ts"
    ],
}