import { z } from "zod";
import { parseWithSchema } from "../ai/extract-json";

const Schema = z.object({ ok: z.boolean() });

describe("extract JSON", () => {
  it("handles raw JSON", () => {
    expect(parseWithSchema('{"ok":true}', Schema)).toEqual({ ok: true });
  });

  it("handles fenced JSON", () => {
    expect(parseWithSchema('```json\n{"ok":true}\n```', Schema)).toEqual({ ok: true });
  });
});
