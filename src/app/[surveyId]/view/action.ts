"use server";

import { db } from "@/lib/drizzle/db";
import { conversation } from "@/lib/drizzle/schema";
import { action } from "@/lib/safe-action";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { zfd } from "zod-form-data";

const schemaUpdateInitialFormSurvey = z.object({
  fingerprintId: z.string(),
  data: z.record(z.string(), z.string().or(z.boolean()).or(z.null())),
  surveyId: z.string(),
});

export const updateInitialFormSurvey = action(
  schemaUpdateInitialFormSurvey,
  async (data) => {

    // save conversation id in cookie
    const res = await db
      .insert(conversation)
      .values({
        surveyId: data.surveyId,
        fingerprintId: data.fingerprintId,
        chatHistoryJson: "[]",
        initialFormDataJson: JSON.stringify(data.data),
      })
      .returning({ id: conversation.id })
      .execute();

    // save conversation id in cookie
    cookies().set(data.surveyId, res[0].id);
  },
);

const deleteConversationSchema = z.object({
  conversationId: z.string(),
  surveyId: z.string(),
});

export const deleteConversation = action(
  deleteConversationSchema,
  async (data) => {
    await db
      .delete(conversation)
      .where(eq(conversation.id, data.conversationId))
      .execute();

    cookies().delete(data.surveyId);
    redirect("/" + data.surveyId + "/view");
  },
);
