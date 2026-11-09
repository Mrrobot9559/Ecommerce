const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const jwt = require("jsonwebtoken");
const userServices = require("../services/user.services");

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
};

const getPublicUser = (user) => {
    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;
    return userData;
};

const generateTokens = async (user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await userServices.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, "Username or email is already registered");
    }

    const user = await userServices.createUser({
        email,
        password,
    });
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                getPublicUser(user),
                "User registered successfully"
            )
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const identifiers = [];
    if (username) {
        identifiers.push({ username });
    }
    if (email) {
        identifiers.push({ email });
    }

    const user = await userServices.findOne(
        { $or: identifiers },
        "+password +refreshToken"
    );
    if (!user || !(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid username/email or password");
    }

    const { accessToken, refreshToken } = await generateTokens(user);
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: getPublicUser(user), accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    if (!process.env.REFRESH_TOKEN_SECRET) {
        throw new Error("REFRESH_TOKEN_SECRET is not set");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "NotBeforeError"
        ) {
            throw new ApiError(401, "Invalid or expired refresh token");
        }
        throw error;
    }

    if (
        !decodedToken ||
        typeof decodedToken !== "object" ||
        typeof decodedToken._id !== "string"
    ) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const user = await userServices.findOne(
        { _id: decodedToken._id },
        "+refreshToken"
    );
    if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Refresh token is no longer valid");
    }

    const {
        accessToken,
        refreshToken: newRefreshToken,
    } = await generateTokens(user);

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "Access token refreshed successfully"
            )
        );
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await userServices.findOne(
        { _id: req.user._id },
        "+password"
    );
    if (!user || !(await user.isPasswordCorrect(oldPassword))) {
        throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});



const logoutUser = asyncHandler(async (req, res) => {
    const user = await userServices.findOne(
        { _id: req.user._id },
        "+refreshToken"
    );
    if (user && user.refreshToken) {
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });
    }

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    changePassword,
    logoutUser,
};