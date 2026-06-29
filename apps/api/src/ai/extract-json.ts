import { z } from "zod";

export function extractJsonCandidate(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return trimmed;
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export function parseJsonFromText(text: string): unknown {
  return JSON.parse(extractJsonCandidate(text));
}

export function parseWithSchema<TSchema extends z.ZodTypeAny>(
  text: string,
  schema: TSchema
): z.infer<TSchema> {
  return schema.parse(parseJsonFromText(text));
}
