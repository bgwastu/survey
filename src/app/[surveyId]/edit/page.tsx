import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Container, Stack, Text, Title } from "@mantine/core";
import { notFound, redirect } from "next/navigation";
import SurveyEditForm from "./survey-edit-form";
import { db } from "@/lib/drizzle/db";
import { conversation, survey } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

export default async function Page({
  params,
  searchParams,
}: {
  params: { surveyId: string };
  searchParams?: { create: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    redirect("/api/auth/login?post_login_redirect_url=/");
  }

  const res = await db
    .select()
    .from(survey)
    .leftJoin(conversation, eq(survey.id, conversation.surveyId))
    .where(eq(survey.id, params.surveyId))
    .get();

  if (!res) {
    notFound();
  }

  if (res.survey.isActive) {
    return <Text>Survey need to be deactivated before editing.</Text>;
  }

  let isCreate = searchParams?.create === "true";

  if (isCreate && res.conversation) {
    isCreate = false;
  }

  return (
    <Stack>
      <Title>{isCreate ? "Create new survey" : "Edit survey"}</Title>
      <SurveyEditForm
        survey={res.survey}
        alreadyHasRespondent={res.conversation !== null}
      />
    </Stack>
  );
}
