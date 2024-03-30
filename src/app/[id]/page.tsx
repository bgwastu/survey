import { db } from "@/lib/drizzle/db";
import {
  conversation,
  survey
} from "@/lib/drizzle/schema";
import { css } from "@/styled-system/css";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Box, Button, Flex, Stack, Text, Title } from "@mantine/core";
import { IconCopy } from "@tabler/icons-react";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login?post_login_redirect_url=/" + params.id);
  }

  const currentSurvey = await db
    .select()
    .from(survey)
    .where(and(eq(survey.id, params.id), eq(survey.userId, user.id)))
    .get();

  if (!currentSurvey) {
    return notFound();
  }

  const conversations = await db
    .select()
    .from(conversation)
    .where(eq(conversation.surveyId, currentSurvey.id));

  return (
    <Stack>
      <Title>{currentSurvey.title}</Title>
      <Box>
        <Text fw="bold">Background:</Text>
        <Text className={css({ whiteSpace: "pre-wrap" })}>
          {currentSurvey.background}
        </Text>
      </Box>
      <Box>
        <Text fw="bold">Objectives:</Text>
        <Text className={css({ whiteSpace: "pre-wrap" })}>
          {currentSurvey.objectives}
        </Text>
      </Box>
      <Box>
        <Text fw="bold">Total Responses:</Text>
        {conversations.length !== 0 ? (
          <Text>{conversations.length}</Text>
        ) : (
          <Text>No Data</Text>
        )}
      </Box>

      <Flex gap="sm">
        <Button leftSection={<IconCopy size={20} />}>Copy survey URL</Button>
        <Button color="red" variant="outline">
          Remove Survey
        </Button>
      </Flex>
    </Stack>
  );
}
