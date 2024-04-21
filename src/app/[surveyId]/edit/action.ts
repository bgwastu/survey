"use server";

import { db } from "@/lib/drizzle/db";
import { survey } from "@/lib/drizzle/schema";
import { action } from "@/lib/safe-action";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  id: z.string(),
  title: z.string().min(3, {}).max(255),
  description: z.string().min(3).max(1000),
  background: z.string().min(3).max(1000),
  objectives: z.string().min(3).max(1000),
  targetAudiences: z.string().min(3).max(1000),
  preferredLanguages: z.string().min(3).max(1000),
  initialFormJson: z.string().default("[]"),
});

export const updateSurvey = action(schema, async (formData) => {
  const { getUser } = getKindeServerSession();

  const user = await getUser();

  if (!user) {
    return {
      failure: "User not found",
    };
  }

  const res = await db.update(survey).set({
    userId: user.id,
    ...formData,
  }).where(and(eq(survey.id, formData.id), eq(survey.userId, user.id)));

  if (res.rowsAffected !== 1) {
    return {
      failure: "Survey not found",
    };
  }

  redirect("/" + formData.id);
});
