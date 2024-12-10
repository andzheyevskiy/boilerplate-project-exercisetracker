class customError {
    constructor(errorType, error = null) {
        this.name = errorType.name
        this.message = errorType.message
        this.code = errorType.code
        this.error = error
    }
}

const DBErrors = {
    Validation: {
        name: "DB: Validation Error",
        message: "Failed to validate item",
        code: 500
    },
    Save: {
        name: "DB: Save Error",
        message: "Failed to save item",
        code: 500
    },
    Find: {
        name: "DB: Find Error",
        message: "Failed to find item",
        code: 500
    },
    Format: {
        name: "DB: Format Error",
        message: "Failed to format item",
        code: 500
    }
}

module.exports = {
    customError,
    DBErrors
}