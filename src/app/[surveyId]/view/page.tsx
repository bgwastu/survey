import { db } from "@/lib/drizzle/db";
import { conversation, survey } from "@/lib/drizzle/schema";
import { Stack, Text, Title } from "@mantine/core";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ChatPage from "./chat-page";
import InitialForm from "./initial-form";

export default async function Page({
  params,
}: {
  params: { surveyId: string };
}) {
  const currentSurvey = await db
    .select()
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

  const hasInitialForm = currentSurvey.initialFormJson !== "[]";

  const cid = cookies().get(currentSurvey.id)?.value;

  if (cid !== undefined) {
    const currentConversation = await db
      .select()
      .from(conversation)
      .where(eq(conversation.id, cid))
      .get();

    if (currentConversation === undefined) {
      notFound();
    }

    const chatHistory = JSON.parse(currentConversation.chatHistoryJson);

    return (
      <ChatPage
        conversationId={currentConversation.id}
        surveyId={currentSurvey.id}
        chatHistory={chatHistory}
      />
    );
  }

  return (
    <Stack>
      <Stack gap={4}>
        <Title>{currentSurvey.title}</Title>
        <Text>{currentSurvey.description}</Text>
      </Stack>
      <InitialForm
        preferredLanguageList={currentSurvey.preferredLanguages.split(",")}
        surveyId={currentSurvey.id}
        initialFormList={JSON.parse(currentSurvey.initialFormJson)}
      />
    </Stack>
  );
}
