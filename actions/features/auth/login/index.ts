"use server";

import { loginSchema, LoginValues } from "@/schemas/features/login";

export async function loginAction(data: LoginValues) {
  try {
    const parsed = loginSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid form data. Please check your inputs and try again.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { identifier, password } = parsed.data;

    console.log(parsed.data);

    // TODO: Replace with real DB lookup + password hashing comparison
    if (identifier == "raj021159@gmail.com" && password == "123456789") {
      return {
        success: true,
        message: "Login successful.",
      };
    }

    // Generic message (security best practice)
    return {
      success: false,
      message: "Invalid email or password.",
    };
  } catch (error) {
    console.error("Login error:", error);

    return {
      success: false,
      message: "Something went wrong while logging in. Please try again later.",
    };
  }
}
