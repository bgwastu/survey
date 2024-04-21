import { db } from "@/lib/drizzle/db";
import { conversation, survey } from "@/lib/drizzle/schema";
import { css } from "@/styled-system/css";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  Title
} from "@mantine/core";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CloseSurveyButton from "./close-survey-button";
import DeleteSurveyButton from "./delete-survey-button";
import ShareSurveyButton from "./share-survey-button";

export default async function Page({
  params,
}: {
  params: { surveyId: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login?post_login_redirect_url=/" + params.surveyId);
  }

  const currentSurvey = await db
    .select()
    .from(survey)
    .where(and(eq(survey.id, params.surveyId), eq(survey.userId, user.id)))
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
      <Stack gap={4}>
        <Title>{currentSurvey.title}</Title>
        <Text className={css({ whiteSpace: "pre-wrap" })}>
          {currentSurvey.description}
        </Text>
        <Group gap="xs">
          <Badge
            variant="dot"
            color={currentSurvey.isActive ? "green" : "red"}
            size="md"
          >
            {currentSurvey.isActive ? "Survey Active" : "Survey Closed"}
          </Badge>
          <CloseSurveyButton
            surveyId={currentSurvey.id}
            isSurveyActive={currentSurvey.isActive}
          />
        </Group>
      </Stack>

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
        <Text fw="bold">Target Audiences:</Text>
        <Text className={css({ whiteSpace: "pre-wrap" })}>
          {currentSurvey.targetAudiences}
        </Text>
      </Box>
      <Box>
        <Text fw="bold">Preferred Langauges:</Text>
        <Group gap="xs">
          {currentSurvey.preferredLanguages.split(",").map((lang) => {
            return (
              <Badge key={lang} variant="light">
                {lang}
              </Badge>
            );
          })}
        </Group>
      </Box>
      <Box>
        <Text fw="bold">Total Responses:</Text>
        {conversations.length !== 0 ? (
          <Text>{conversations.length}</Text>
        ) : (
          <Text>No Data</Text>
        )}
      </Box>

      <Group gap="sm">
        <Button>View Survey Result</Button>
        <ShareSurveyButton surveyId={currentSurvey.id} />
      </Group>
      <Divider label="OR" />
      <Stack>
        <Stack gap={2}>
          <Button
            variant="outline"
            disabled={currentSurvey.isActive}
            component={Link}
            href={`/${currentSurvey.id}/edit`}
          >
            Edit survey
          </Button>
          {currentSurvey.isActive ? (
            <Text size="sm" c="dimmed">
              You need to close the survey before you can edit it.
            </Text>
          ) : null}
        </Stack>
        <DeleteSurveyButton surveyId={currentSurvey.id} />
      </Stack>
    </Stack>
  );
}
