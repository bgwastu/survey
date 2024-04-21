import { db } from "@/lib/drizzle/db";
import { survey } from "@/lib/drizzle/schema";
import { Stack, Text } from "@mantine/core";
import { eq } from "drizzle-orm";
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
      isActive: survey.isActive,
    })
    .from(survey)
    .where(eq(survey.id, params.surveyId))
    .get();

  if (!currentSurvey) {
    notFound();
  }

  if (!currentSurvey.isActive) {
    return (
      <Stack>
        <Text>{`Survey "${currentSurvey.title}" is no longer accepting responses. Thank you for your participation!`}</Text>
      </Stack>
    );
  }

  // TODO: add initial form

  return (
    <Stack>
      <ChatPage surveyId={currentSurvey.id} surveyTitle={currentSurvey.title} />
    </Stack>
  );
}
