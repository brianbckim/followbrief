import { DocumentsSearchInputSchema } from "../tools/documents-search";
import { TasksCreateInputSchema } from "../tools/tasks-create";

describe("tool input validation", () => {
  it("catches an invalid search limit", () => {
    expect(() =>
      DocumentsSearchInputSchema.parse({ query: "Acme", limit: 99 })
    ).toThrow();
  });

  it("catches empty task creation input", () => {
    expect(() => TasksCreateInputSchema.parse({ tasks: [] })).toThrow();
  });
});
