/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface UpdateProfileResult {
  success?: boolean;
  message?: string;
  error?: string;
  updatedUser?: {
    name?: string | null;
    image?: string | null; // Auth.js uses 'image' for avatar in session
    favoriteSubject?: string | null;
  };
}

export async function updateUserAvatarAndPreferences(
  prevState: UpdateProfileResult | undefined,
  formData: FormData
): Promise<UpdateProfileResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "User not authenticated." };
  }
  const userId = session.user.id;

  console.log("Server Action received formData type:", typeof formData);
  console.log(
    "Server Action received formData instanceof FormData:",
    formData instanceof FormData
  );
  console.log("Server Action received formData value:", formData);

  if (typeof formData.get !== "function") {
    console.error(
      "formData received in server action does NOT have a .get method!"
    );
    const avatarUrlFromObject = (formData as any).avatarUrl;
    const favoriteSubjectFromObject = (formData as any).favoriteSubject;
    console.log("Attempting to read as plain object:", {
      avatarUrlFromObject,
      favoriteSubjectFromObject,
    });

    return { error: "Invalid form data received by server action." };
  }

  const avatarUrl = formData.get("avatarUrl") as string | null;
  let favoriteSubject = formData.get("favoriteSubject") as string | null;

  // Basic validation
  if (favoriteSubject === "") {
    favoriteSubject = null;
  }
  if (!avatarUrl && !favoriteSubject) {
    return { error: "No changes submitted." };
  }

  try {
    const dataToUpdate: {
      avatarUrl?: string;
      favoriteSubject?: string | null;
    } = {};
    if (avatarUrl) dataToUpdate.avatarUrl = avatarUrl;
    if (formData.has("favoriteSubject")) {
      // Check if the field was submitted
      dataToUpdate.favoriteSubject = favoriteSubject;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { name: true, avatarUrl: true, favoriteSubject: true }, // Select fields that might be in session
    });

    revalidatePath("/kid/profile/edit");
    revalidatePath("/kid/home");
    revalidatePath("/(platform)/kid/(kid-platform)/layout", "layout"); // For KidUserNav

    return {
      success: true,
      message: "Profile updated!",
      updatedUser: {
        name: updatedUser.name,
        image: updatedUser.avatarUrl,
        favoriteSubject: updatedUser.favoriteSubject,
      },
    };
  } catch (error) {
    console.error("Error updating user avatar/preferences:", error);
    return { error: "Failed to update profile." };
  }
}
