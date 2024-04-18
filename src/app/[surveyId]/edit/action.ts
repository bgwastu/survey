"use server";

import { db } from "@/lib/drizzle/db";
import { survey } from "@/lib/drizzle/schema";
import { ask } from "@/lib/openai";
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
});

export async function updateSurvey(_: any, formData: FormData) {
  const { getUser } = getKindeServerSession();

  const user = await getUser();

  if (!user) {
    return {
      isError: true,
      text: "Unauthorized",
    };
  }

  console.log("test");

  const validated = schema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    background: formData.get("background"),
    objectives: formData.get("objectives"),
    targetAudiences: formData.get("targetAudiences"),
    preferredLanguages: formData.get("preferredLanguages"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      data: null,
    };
  }

  const res = await db.update(survey).set({
    userId: user.id,
    ...validated.data,
    initialFormJson: "{}", // TODO: add proper form json
    isActive: true,
  }).where(and(eq(survey.id, validated.data.id), eq(survey.userId, user.id)));

  if (res.rowsAffected !== 1) {
    return {
      message: {
        isError: true,
        text: "Error creating survey",
      },
    };
  }

  redirect("/");
}
