import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function ask(
  prompt: string,
  input: string,
): Promise<["success" | "error", string]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    if (!response.choices[0].message.content) {
      throw ["error", "Error on OpenAI response"];
    }

    return ["success", response.choices[0].message.content];
  } catch (e: any) {
    console.error(e);
    return ["error", e.message];
  }
}
