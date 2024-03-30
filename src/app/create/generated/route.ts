import { ask } from "@/lib/openai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// refine the wording
export async function POST(request: NextRequest) {
  const schema = z.object({
    title: z.string(),
    inputName: z.enum(["background", "objectives"]),
    inputText: z.string(),
  });

  const { title, inputName, inputText } = schema.parse(await request.json());

  const prompt = `Survey Title: ${title}

  Current ${inputName}:
  ${inputText}
  
  Instructions:
  Please rewrite the ${inputName} survey ${inputName} to make it more concise, and informative with third person view. The improved ${inputName} should clearly explain the ${inputName} of the survey.

  ${
    inputName === "objectives"
      ? "Also, list out 2-3 key things this survey should uncover."
      : null
  }
  
  Improved ${inputName}:`;

  const [status, res] = await ask(prompt, "");

  if (status === "error") {
    return NextResponse.json({ error: "Error when prompting." }, {
      status: 500,
    });
  }
  return NextResponse.json({ text: res });
}
