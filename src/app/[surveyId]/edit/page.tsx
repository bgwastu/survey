import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Container, Stack, Text, Title } from "@mantine/core";
import { notFound, redirect } from "next/navigation";
import SurveyEditForm from "./survey-edit-form";
import { db } from "@/lib/drizzle/db";
import { survey } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

// TODO: Make this page modular (create and edit)
export default async function Page({
  params,
}: {
  params: { surveyId: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) {
    redirect("/api/auth/login?post_login_redirect_url=/");
  }

  const currentSurvey = await db
    .select()
    .from(survey)
    .where(eq(survey.id, params.surveyId))
    .get();

  if (!currentSurvey) {
    notFound();
  }

  if(currentSurvey.isActive){
    return <Text>Survey need to be deactivated before editing.</Text>
  }

  return (
    <Stack>
      <SurveyEditForm survey={currentSurvey}/>
    </Stack>
  );
}
