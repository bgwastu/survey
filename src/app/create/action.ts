"use server";

import { db } from "@/lib/drizzle/db";
import { survey } from "@/lib/drizzle/schema";
import { ask } from "@/lib/openai";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3, {}).max(255),
  background: z.string().min(3).max(1000),
  objectives: z.string().min(3).max(1000),
});

export async function createSurvey(_: any, formData: FormData) {
  const { getUser } = getKindeServerSession();

  const user = await getUser();

  if (!user) {
    return {
      isError: true,
      text: "Unauthorized",
    };
  }

  console.log("Creating survey");

  const validated = schema.safeParse({
    title: formData.get("title"),
    background: formData.get("background"),
    objectives: formData.get("objectives"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      data: null,
    };
  }

  const res = await db.insert(survey).values({
    userId: user.id,
    ...validated.data,
  });

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
