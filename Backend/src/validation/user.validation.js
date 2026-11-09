const { z } = require("zod");

const registerUserSchema = z.object({
    email: z.string()
        .trim()
        .email("A valid email is required")
        .toLowerCase(),

    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /[^A-Za-z0-9]/,
            "Password must contain at least one special character"
        ),
});

const loginUserSchema = z
    .object({
        email: z.preprocess(
            (value) =>
                typeof value === "string" && !value.trim()
                    ? undefined
                    : value,
            z.string()
                .trim()
                .email("A valid email is required")
                .toLowerCase()
                .optional()
        ),

        password: z.string().min(1, "Password is required"),
    })
    .refine(({ username, email }) => Boolean(username || email), {
        message: "Username or email is required",
        path: ["username"],
    });

const refreshTokenSchema = z
    .object({
        refreshToken: z.string().optional(),
    })
    .nullable()
    .optional();

module.exports = {
    registerUserSchema,
    loginUserSchema,
    refreshTokenSchema,
};