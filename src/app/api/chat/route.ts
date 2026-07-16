import { streamText, stepCountIs, convertToModelMessages, type UIMessage } from "ai";
import { agentModel, systemPrompt } from "@/lib/ai/agent";
import { tools } from "@/lib/ai/tools";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("BODY RECIBIDO:", JSON.stringify(body, null, 2));
  console.log("TIPO DE messages:", typeof body.messages, Array.isArray(body.messages));

  const { messages }: { messages: UIMessage[] } = body;

  const result = streamText({
    model: agentModel,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
    onError: (error) => {
      console.error("Stream error:", error);
    },
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error("Stream response error:", error);
      return "Ocurrió un error al procesar la solicitud. Por favor, intente nuevamente más tarde.";
    }
  });
} 