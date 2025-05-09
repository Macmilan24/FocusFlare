"use server";

import { signIn as nextAuthSignIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export interface LoginFormState {
  message: string | null;
  isError: boolean;
}

export interface RegisterFormState {
  message: string | null;
  isError: boolean;
  success?: boolean;
}

export async function authenticate(
  prevState: LoginFormState | undefined,
  formData: FormData
): Promise<LoginFormState> {
  try {
    const loginId = formData.get("loginId") as string;
    const password = formData.get("password") as string;

    if (!loginId || !password) {
      return {
        message: "Please provide both email/username and password.",
        isError: true,
      };
    }

    await nextAuthSignIn("credentials", {
      loginId,
      password,
      redirectTo: "/dashboard",
    });

    return { message: "Login successful! Redirecting...", isError: false };
  } catch (error) {
    if (error instanceof AuthError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      switch ((error as any).type) {
        case "CredentialsSignin":
          return {
            message: "Invalid email/username or password.",
            isError: true,
          };
        case "CallbackRouteError":
          return {
            message: `Login failed: ${error?.message || "Callback error"}`,
            isError: true,
          };
        default:
          // Log the error for server-side inspection
          console.error("AuthError during signin:", error);
          return {
            message: "Something went wrong during login.",
            isError: true,
          };
      }
    }

    console.error("Unexpected error during signin:", error);
    return {
      message: "An unexpected error occurred. Please try again.",
      isError: true,
    };
  }
}

// -- New Register Function --
export async function registerParent(
  prevState: RegisterFormState | undefined,
  formData: FormData
): Promise<RegisterFormState> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;

    if (!email || !password || !passwordConfirm) {
      return {
        message: "Please provide all required fields.",
        isError: true,
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { message: "Invalid email format.", isError: true };
    }
    if (password.length < 6) {
      // Example: Minimum password length
      return {
        message: "Password must be at least 6 characters long.",
        isError: true,
      };
    }

    if (password !== passwordConfirm) {
      return {
        message: "Passwords do not match.",
        isError: true,
      };
    }

    // --- Check if user already exists ---
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        message: "An account with this email already exists.",
        isError: true,
      };
    }

    // --- Hash the password ---
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // --- Create the user ---
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.PARENT,
      },
    });

    return {
      message: "Registration successful! You can now sign in.",
      isError: false,
      success: true,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      message: "An error occurred during registration. Please try again.",
      isError: true,
    };
  }
}
