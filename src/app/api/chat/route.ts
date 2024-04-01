import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ask, openai } from "@/lib/openai";
import { db } from "@/lib/drizzle/db";
import { conversation, Survey, survey } from "@/lib/drizzle/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { messages, surveyId } = await req.json();

    const currentSurvey = await db.select().from(survey).where(
      and(eq(survey.id, surveyId), eq(survey.isActive, true)),
    ).get();

    if (!currentSurvey) {
      return Response.json({ error: "Survey not found" }, { status: 404 });
    }

    const system: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: "system",
      content:
        `You are an AI assistant designed to conduct an open-ended survey titled ${currentSurvey.title}. Your role is to interview the user, asking questions that encourage them to share their thoughts, experiences, and opinions related to the survey topic. 

      Survey Background:
      ${currentSurvey.background}
      
      Survey Objectives:
      ${currentSurvey.objectives}
      
      During the conversation, keep the following in mind:
      - Welcome the user and ask the first question when they say "[BEGIN]".
      - Be curious, attentive, and maintain engagement.
      - Ask follow-up questions to encourage elaboration.
      - Provide clarification when needed.
      - Ensure all objectives are addressed.
      - Respond with "[STOP]" when all objectives are fulfilled.
      
      Ensure that all objectives are met while maintaining a conversational and engaging tone.`,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      stream: true,
      messages: [system, ...messages],
    });

    const stream = OpenAIStream(response, {
      onCompletion: async (completion) => {
        const isFinished = completion.includes("[STOP]");

        if (isFinished) {
          const summary = await getSurveySummary(messages, currentSurvey);

          // Save the conversation to the database
          await db.insert(conversation).values({
            surveyId: currentSurvey.id,
            chatHistoryJson: JSON.stringify(messages),
            summary,
          });
        }
      },
    });
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getSurveySummary(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  survey: Survey,
) {
  const strMessages = messages.map((message) =>
    message.role + ": " + message.content
  ).join("\n");

  const prompt =
    `As an AI assistant, your task is to provide an exclusive summary of the conversation you held with the user.

  Details of the survey are as follows:
  Title:
  ${survey.title}
  Background:
  ${survey.background}
  Objectives:
  ${survey.objectives}

  Below is the transcript of the conversation:
  """
  ${strMessages}
  """`;

  const [status, summary] = await ask(prompt, "");
  if (status === "success") {
    return summary;
  } else {
    // TODO: handle error (using notification or logging)
    return "Failed to generate a summary";
  }
}
