import { db } from "@/lib/drizzle/db";
import { conversation, Conversation, survey } from "@/lib/drizzle/schema";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Flex } from "@mantine/core";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { useState } from "react";
import ResponseList from "./response-list";

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

  const res = await db
    .select({
      conversation,
    })
    .from(conversation)
    .leftJoin(survey, eq(conversation.surveyId, survey.id))
    .where(
      and(
        eq(conversation.surveyId, params.surveyId),
        eq(survey.userId, user.id)
      )
    )
    .execute();

  if (res.length === 0) {
    notFound();
  }

  return <ResponseList conversations={res.map((e) => e.conversation)} />;
}
