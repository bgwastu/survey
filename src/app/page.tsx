// import { LoginLink } from "@kinde-oss/kinde-auth-nextjs";
// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/lib/drizzle/db";
import { survey } from "@/lib/drizzle/schema";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Button, Container, Flex, Stack, Title, Text } from "@mantine/core";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import ItemSurvey from "./item-survey";
import Link from "next/link";
import CreateSurveyButton from "./create-survey-button";

export default async function Home() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login?post_login_redirect_url=/");
  }

  // get survey basd on user
  const surveys = await db
    .select()
    .from(survey)
    .where(eq(survey.userId, user.id))
    .orderBy(desc(survey.createdAt));

  return (
    <Stack>
      <Flex justify="space-between">
        <Title>My Survey</Title>
        <CreateSurveyButton />
      </Flex>
      {surveys.length === 0 ? (
        <Text>No survey found.</Text>
      ) : (
        surveys.map((s) => <ItemSurvey key={s.id} survey={s} />)
      )}
    </Stack>
  );
}
