"use server";

import { db } from "@/lib/drizzle/db";
import { survey } from "@/lib/drizzle/schema";
import { ask } from "@/lib/openai";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { z } from "zod";

const schema = z.object({
  userId: z.string(),
  title: z.string().min(3, {}).max(255),
  background: z.string().min(3).max(1000),
  objectives: z.string().min(3).max(1000),
  questions: z.string().min(3).max(1000),
});

export async function createSurvey(_: any, formData: FormData) {
  const validated = schema.safeParse({
    userId: formData.get("userId"),
    title: formData.get("title"),
    background: formData.get("background"),
    objectives: formData.get("objectives"),
    questions: formData.get("questions"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      data: null,
    };
  }

  console.log("processing...");

  // TODO: generate answerJsonStructure based on questions
  const answerJsonStructure = await ask(
    `
    I'm creating a survey about ${validated.data.title}.
    The survey is about ${validated.data.background}.
    The objectives of the survey are ${validated.data.objectives}.
    The possible question ${validated.data.questions}.

    Your task is think about the possible questions and answers for this survey. Add as many questions as you can think of, and provide the possible answer for each question. If possible, make sure to provide multiple-choice questions with the possible answers.
    
    Generate ONLY a JSON structure for the potential question and answer, with the following format:
    [
      {
        question: "QUESTION GOES HERE",
        type: "multiple-choice" | "open-ended",
        choices: ["CHOICE 1", "CHOICE 2", "CHOICE 3"] | null,
      }
      ...
    ]`,
    "",
  );
  console.log(answerJsonStructure);

  // await db.insert(survey).values({
  //   userId: user.id,
  //   answerJsonStructure,
  //   ...validated.data,
  // })
}
