const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));

        return next(new ApiError(400, "Request validation failed", errors));
    }

    req.body = result.data;
    return next();
};
 
module.exports = validate;
