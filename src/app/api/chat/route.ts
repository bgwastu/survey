import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { openai } from "@/lib/openai";
import { db } from "@/lib/drizzle/db";
import { conversation, survey } from "@/lib/drizzle/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { messages, conversationId } = await req.json();

    const res = await db.select().from(conversation).where(
      eq(conversation.id, conversationId),
    )
      .innerJoin(survey, eq(survey.id, conversation.surveyId))
      .get();

    const currentSurvey = res?.survey;

    if (!currentSurvey) {
      return Response.json({ error: "Survey not found" }, { status: 404 });
    }

    const system: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: "system",
      content:
        `You are an AI assistant who conduct survey titled ${currentSurvey.title}. Your role is to interview the user, asking questions that encourage them to share their thoughts, experiences, and opinions based on the survey objectives. The user's responses will help the surveyor to gather insights and feedback.

      Survey Background:
      ${currentSurvey.background}
      
      Survey Objectives:
      ${currentSurvey.objectives}

      Current user type detail:
      ${currentSurvey.targetAudiences}

      More data that user has provided:
      ${
          Object.entries(JSON.parse(res.conversation.initialFormDataJson)).map((
            [key, value],
          ) => `${key}: ${value}`).join(", ")
        }
      
      Notes:
      - Greet and welcome the user if the user says "[BEGIN]".
      - Use ${JSON.parse(res.conversation.initialFormDataJson)["preferredLanguage"]} language when conducting the interview.
      - Make interview sessions short yet engaging.
      - Ask question just how like a real conversation would be.
      - Ask follow-up questions to encourage elaboration.
      - Lead the conversation from basic questions to more specific ones, make sure to cover all objectives.
      - Respond with "[STOP]" with a closing message and follow-up based on survey objectives if all objectives are met.
      
      Ensure that all objectives are met while maintaining a conversational and engaging tone.`,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [system, ...messages],
    });

    const stream = OpenAIStream(response, {
      onCompletion: async (completion) => {
        // Update the conversation with the chat history
        await db.update(conversation)
          .set({
            chatHistoryJson: JSON.stringify([...messages, {
              role: "system",
              content: completion,
            }]),
          })
          .where(eq(conversation.id, conversationId))
          .execute();
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
