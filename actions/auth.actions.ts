/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import {
  auth,
  unstable_update as nextAuthServerUpdateSession,
} from "@/lib/auth";
import { signIn as nextAuthSignIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { Role, UserLearningProgress } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface LoginFormState {
  message: string | null;
  isError: boolean;
}

export interface RegisterFormState {
  message: string | null;
  isError: boolean;
  success?: boolean;
}

export interface AddChildFormState {
  message: string | null;
  isError: boolean;
  success?: boolean;
}

export interface ChildData {
  id: string;
  username: string | null;
  name: string | null;
}

export interface StoryProgress
  extends Pick<UserLearningProgress, "status" | "completedAt"> {
  contentId: string;
}

export interface ChildData {
  id: string;
  username: string | null;
  name: string | null;
  storyProgress?: StoryProgress[];
}

export interface ChildDashboardOverview
  extends Omit<ChildData, "storyProgress" | "quizProgress"> {
  id: string;
  username: string | null;
  name: string | null;
  avatarSeed?: string;
  lastActivity?: string;
  lastActivityDate?: Date | null;
}

interface SessionUpdateData {
  name?: string;
  points?: number;
  image?: string | null;
  favoriteSubject?: string | null;
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
      redirect: false,
    });

    return { message: "Login successful! Redirecting...", isError: false };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            message: "Invalid email/username or password.",
            isError: true,
          };
        default:
          console.error("AuthError during signin:", error);
          return {
            message: "Something went wrong during login.",
            isError: true,
          };
      }
    }

    if ((error as any)?.digest?.startsWith("NEXT_REDIRECT")) {
      // This should not happen with redirect: false, but as a safeguard
      return { message: "Redirecting...", isError: false };
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
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;

    if (!name || !email || !password || !passwordConfirm) {
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
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- Create the user ---
    await prisma.user.create({
      data: {
        name,
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

// --- SignOut ACTION ---

export async function handleSignOut() {
  try {
    await signOut({ redirect: true, redirectTo: "/auth/signin" });
  } catch (error) {
    if ((error as any)?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Sign out error:", error);
    // Optionally, re-throw or handle the error in a way that the UI can be notified.
  }
}

// --- ADD CHILD ACTION ---

export async function addChild(
  prevState: AddChildFormState | undefined,
  formData: FormData
): Promise<AddChildFormState> {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.PARENT) {
    return {
      message: "Unauthorized: Only parents can add children.",
      isError: true,
    };
  }

  const parentId = session.user.id;
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;
    const childsName = formData.get("childsName") as string | null;

    console.log("Attempting to add child with username:", username);

    // --- Basic Validation ---
    if (!username || !password || !passwordConfirm) {
      return {
        message: "Please fill in username, password, and confirm password.",
        isError: true,
      };
    }
    if (password.length < 4) {
      return {
        message: "Child's password must be at least 4 characters long.",
        isError: true,
      };
    }
    if (password !== passwordConfirm) {
      return { message: "Passwords do not match.", isError: true };
    }

    const existingUserByUsername = await prisma.user.findFirst({
      where: { username },
    });
    if (existingUserByUsername) {
      console.log("Username already taken:", username);
      return {
        message: "This username is already taken. Please choose another.",
        isError: true,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const placeholderEmail = `${username
      .toLowerCase()
      .replace(/\s+/g, "_")}@child.placeholder.focusflare.com`;
    console.log("Generated placeholderEmail:", placeholderEmail);

    console.log(
      "Proceeding to create child in transaction with email:",
      placeholderEmail
    );
    await prisma.$transaction(async (tx) => {
      const childUser = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          role: Role.CHILD,
          name: childsName,
          email: placeholderEmail,
        },
      });

      console.log(
        "Child user created in DB:",
        childUser.id,
        childUser.username,
        childUser.email
      );

      await tx.parentChildLink.create({
        data: {
          parentId: parentId,
          childId: childUser.id,
        },
      });
      console.log(
        "ParentChildLink created for parent:",
        parentId,
        "and child:",
        childUser.id
      );
    });

    return {
      message: `Child "${username}" added successfully!`,
      isError: false,
      success: true,
    };
  } catch (error) {
    console.error("Error adding child:", error);

    if (
      (error as any)?.code === "P2002" &&
      (error as any)?.meta?.target?.includes("username")
    ) {
      return {
        message:
          "This username is already taken (database constraint). Please choose another.",
        isError: true,
      };
    }
    return {
      message: "An unexpected error occurred while adding the child.",
      isError: true,
    };
  }
}

// --- GET CHILDREN ACTION ---
export async function getChildrenForParent(): Promise<{
  childrenData?: ChildData[];
  error?: string;
}> {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.PARENT) {
    return { error: "Unauthorized or not a parent." };
  }
  const parentId = session.user.id;

  try {
    // 1. Get the parent's children links
    const parentWithChildrenLinks = await prisma.user.findUnique({
      where: { id: parentId },
      select: {
        parentLink: {
          select: {
            child: {
              select: {
                id: true,
                username: true,
                name: true,

                learningProgress: {
                  where: {},
                  select: {
                    contentId: true,
                    status: true,
                    completedAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!parentWithChildrenLinks) {
      return { error: "Parent not found." };
    }

    const childrenData: ChildData[] = parentWithChildrenLinks.parentLink.map(
      (link) => {
        const child = link.child;
        const storyProgress: StoryProgress[] = child.learningProgress.map(
          (p) => ({
            contentId: p.contentId,
            status: p.status,
            completedAt: p.completedAt,
          })
        );
        return {
          id: child.id,
          username: child.username,
          name: child.name,
          storyProgress: storyProgress,
        };
      }
    );

    return { childrenData };
  } catch (error) {
    console.error("Error fetching children with progress:", error);
    return { error: "Failed to fetch children's data." };
  }
}

export async function refreshClientSession(newUserData: SessionUpdateData) {
  try {
    await nextAuthServerUpdateSession({ user: newUserData }); // Pass the user data to be updated
    console.log("Server-side session update triggered for name:", newUserData);
    return { success: true };
  } catch (error) {
    console.error("Error refreshing client session via server action:", error);
    return { success: false, error: "Could not refresh session." };
  }
}
