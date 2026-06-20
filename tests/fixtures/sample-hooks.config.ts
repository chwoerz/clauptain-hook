import { defineHandler } from "../../src/authoring/define-handler.js";

export const blockDangerous = defineHandler(
  "PreToolUse",
  { matcher: "Bash" },
  async (input) => {
    return {};
  },
);

export const onStop = defineHandler("Stop", async (input) => {
  return {};
});
