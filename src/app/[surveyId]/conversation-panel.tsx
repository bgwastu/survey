"use client";

import { css } from "@/styled-system/css";
import { Stack } from "@mantine/core";
import { Message } from "ai";

export default function ConversationPanel({
  messages,
}: {
  messages: Message[];
}) {
  return (
    <Stack flex={1}>
      {messages
        .filter((v) => {
          return v.content !== "[BEGIN]";
        })
        .map((m, i) => {
          return (
            <div
              key={i}
              className={css({
                whiteSpace: "pre-wrap",
                fontWeight: m.role === "user" ? "600" : "normal",
                overflowAnchor: "auto !important",
              })}
            >
              {m.role === "user" ? "User: " : "AI: "}
              {m.content.replace("[STOP]", "").trim()}
            </div>
          );
        })}
    </Stack>
  );
}
