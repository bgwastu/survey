import { db } from "@/lib/drizzle/db";
import { survey } from "@/lib/drizzle/schema";
import { Stack } from "@mantine/core";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import ChatPage from "./chat-page";

export default async function Page({
  params,
}: {
  params: { surveyId: string };
}) {
  const currentSurvey = await db
    .select({
      id: survey.id,
      title: survey.title,
    })
    .from(survey)
    .where(and(eq(survey.id, params.surveyId), eq(survey.isActive, true)))
    .get();

  if (!currentSurvey) {
    notFound();
  }

  return (
    <Stack>
      <ChatPage surveyId={currentSurvey.id} surveyTitle={currentSurvey.title} />
    </Stack>
  );
}
