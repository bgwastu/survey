import { db } from "@/lib/drizzle/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { z } from "zod";
import { survey } from "@/lib/drizzle/schema";
import { StructuredOutputParser } from "langchain/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { createSurveyModel } from "@/lib/langchain";
import { redirect } from "next/navigation";

const schema = z.object({
  surveyDescription: z.string().min(3, {}),
});

// generate new survey with default from generated by AI
export async function POST(req: Request) {
  const { getUser } = getKindeServerSession();

  const user = await getUser();

  if (!user) {
    return {
      isError: true,
      text: "Unauthorized",
    };
  }

  const formData = await req.json();

  const validated = schema.safeParse({
    surveyDescription: formData.surveyDescription,
  });

  if (!validated.success) {
    return new Response(JSON.stringify(validated.error.flatten().fieldErrors), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const surveyDescription = validated.data.surveyDescription;

  const partialSurvey = await parseSurveyDescription(surveyDescription);

  if (!partialSurvey) {
    return new Response(
      JSON.stringify({ message: "Error parsing survey description" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const res = await db.insert(survey).values({
    userId: user.id,
    initialFormJson: "[]",
    ...partialSurvey,
    preferredLanguages: "English,Bahasa Indonesia",
  }).returning({ id: survey.id }).execute();

  if (!res[0].id) {
    return new Response(
      JSON.stringify({ message: "Error creating survey" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  return new Response(
    JSON.stringify({ id: res[0].id, message: "Survey created" }),
    {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

async function parseSurveyDescription(description: string) {
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      title: z
        .string()
        .describe(
          "The title of the survey. This should be a concise and descriptive title that summarizes the purpose of the survey.",
        ),
      description: z
        .string()
        .describe(
          "A brief description of the survey with maxium 100 characters. This should provide an overview of the survey and its purpose.",
        ),
      background: z.string().describe(
        "The background of the survey. This should provide context for the survey, including any relevant information about the topic or problem that the survey will address.",
      ),
      objectives: z
        .string()
        .describe(
          "The objectives of the survey. This should outline the goals and outcomes that the survey aims to achieve. Also include any specific questions or topics that the survey will address.",
        ),
      targetAudiences: z
        .string()
        .describe(
          "The target audience for the survey. This should describe the specific group of people the survey is intended for. Make it as specific as possible, including demographic information",
        ),
    }),
  );

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `{format_instructions}`],
    ["user", "{message}"],
  ]);

  try {
    const result = await RunnableSequence.from([
      prompt,
      createSurveyModel,
      parser,
    ]).invoke({
      format_instructions: parser.getFormatInstructions(),
      message: description,
    });
    return result;
  } catch (e) {
    console.error(e);
  }
}
