const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

const authMiddleware = (req, res, next) => {
  const authorization = req.get("authorization") || "";
  const bearerMatch = authorization.match(/^Bearer\s+(.+)$/i);
  const token = req.cookies?.accessToken || bearerMatch?.[1].trim();

  if (!token) {
    return next(new ApiError(401, "Authentication token is required"));
  }

  if (!process.env.ACCESS_TOKEN_SECRET) {
    return next(new Error("ACCESS_TOKEN_SECRET is not set"));
  }

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!payload || typeof payload !== "object" || !payload._id)
      return next(new ApiError(401, "Invalid authentication token"));
    req.user = payload;
    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired authentication token"));
  }
};

authMiddleware.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new ApiError(403, "Access forbidden: Admin rights required"));
  }
  next();
};
module.exports = authMiddleware;
