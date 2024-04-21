"use client";

import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";
import { css } from "@/styled-system/css";
import {
  ActionIcon,
  Button,
  Flex,
  ScrollArea,
  Stack,
  Textarea,
  Text,
  Center,
} from "@mantine/core";
import { IconSend2 } from "@tabler/icons-react";
import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";

export default function ChatPage({
  surveyId,
  surveyTitle,
}: {
  surveyId: string;
  surveyTitle: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { formRef, onKeyDown } = useEnterSubmit();
  const [status, setStatus] = useState<"initial" | "start" | "finish">(
    "initial"
  );
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
    setMessages,
  } = useChat({
    body: {
      surveyId,
    },
  });

  function onInit() {
    setMessages([
      {
        id: "1",
        role: "user",
        content: "[BEGIN]",
      },
    ]);

    reload();
    setStatus("start");
    inputRef.current?.focus();
  }

  useEffect(
    function scrollToBottom() {
      if (scrollRef.current) {
        scrollRef.current!.scrollTo({
          top: scrollRef.current!.scrollHeight,
          behavior: "smooth",
        });
      }
    },
    [messages]
  );

  useEffect(
    function onFinishState() {
      if (messages.length === 0) return;

      const lastMesage = messages[messages.length - 1];
      if (lastMesage.content.includes("[STOP]")) {
        setStatus("finish");
      }
    },
    [messages]
  );

  if (status === "initial") {
    return (
      <Stack>
        <Text>You are about to start a survey titled &quot;{surveyTitle}&quot;.</Text>
        <Text>Clik the button below to start the survey.</Text>
        <Button onClick={onInit}>Start Survey</Button>
      </Stack>
    );
  }

  return (
    <Stack align="stretch">
      <ScrollArea h="78vh" offsetScrollbars viewportRef={scrollRef}>
        <Stack flex={1}>
          {messages
            .filter((v) => {
              return v.content !== "[BEGIN]";
            })
            .map((m) => (
              <div
                key={m.id}
                className={css({
                  whiteSpace: "pre-wrap",
                  fontWeight: m.role === "user" ? "600" : "normal",
                  overflowAnchor: "auto !important",
                })}
              >
                {m.role === "user" ? "User: " : "AI: "}
                {m.content.replace("[STOP]", "").trim()}
              </div>
            ))}
        </Stack>
      </ScrollArea>
      {status === "finish" ? (
        <Center>
          <Text>Thank you for your time!</Text>
        </Center>
      ) : (
        <form onSubmit={handleSubmit} ref={formRef}>
          <Flex gap="sm">
            <Textarea
              value={input}
              placeholder="Send a message"
              onChange={handleInputChange}
              disabled={isLoading}
              onKeyDown={onKeyDown}
              rightSectionWidth={50}
              ref={inputRef}
              flex={1}
              rightSection={
                <ActionIcon
                  variant="filled"
                  aria-label="Send Message"
                  type="submit"
                  disabled={isLoading}
                >
                  <IconSend2 style={{ width: "70%", height: "70%" }} />
                </ActionIcon>
              }
            />
          </Flex>
        </form>
      )}
    </Stack>
  );
}
