"use server";

import { auth } from "@/lib/auth";
import { getErrorMessage } from "@/actions/utils/utils";

export async function requestPasswordResetAction(email: string): Promise<{ ok: boolean; error?: string }>{
  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: (process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "") + "/auth/reset-password",
      },
    });
    return { ok: true };
  } catch (e: any) {
    console.error(e);
    return { ok: false, error: getErrorMessage(e) };
  }
}

export async function resetPasswordAction(token: string, newPassword: string): Promise<{ ok: boolean; error?: string }>{
  try {
    await auth.api.resetPassword({
      body: {
        token,
        newPassword,
      },
    });
    return { ok: true };
  } catch (e: any) {
    console.error(e);
    return { ok: false, error: getErrorMessage(e) };
  }
}
