"use server";

import { action } from "@/lib/safe-action";
import { z } from "zod";
import { db } from "@/lib/drizzle/db";
import { survey } from "@/lib/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const deleteSurveySchema = z.object({
  id: z.string(),
});

export const deleteSurvey = action(deleteSurveySchema, async ({ id }) => {
  // Delete survey with id
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return { failure: "User not found" };
  }

  await db.delete(survey).where(
    and(eq(survey.id, id), eq(survey.userId, user.id)),
  );

  redirect("/");
});

const toggleCloseSurveySchema = z.object({
  id: z.string(),
  currentStatus: z.boolean(),
});

export const toggleCloseSurvey = action(toggleCloseSurveySchema, async ({ id, currentStatus }) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return { failure: "User not found" };
  }

  await db.update(survey).set({ isActive: !currentStatus }).where(
    and(eq(survey.id, id), eq(survey.userId, user.id)),
  );

  redirect(`/${id}`);
});
