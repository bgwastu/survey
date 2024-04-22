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
import { Message, useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { deleteConversation } from "./action";
import { useShallowEffect } from "@mantine/hooks";

export default function ChatPage({
  conversationId,
  surveyId,
  chatHistory,
}: {
  conversationId: string;
  surveyId: string;
  chatHistory: Message[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { formRef, onKeyDown } = useEnterSubmit();
  const [status, setStatus] = useState<
    "loading" | "initial" | "start" | "finish"
  >("loading");

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
      conversationId,
    },
    initialMessages: chatHistory,
  });

  async function startConversation() {
    setStatus("loading");
    setMessages([
      {
        id: "1",
        role: "user",
        content: "[BEGIN]",
      },
    ]);

    await reload();
    inputRef.current?.focus();
    setStatus("start");
  }

  useEffect(function setInitialStatus() {
    if (chatHistory.length === 0) {
      setStatus("initial");
      return;
    }

    const lastMesage = messages[messages.length - 1];
    if (lastMesage.content.includes("[STOP]")) {
      setStatus("finish");
      return;
    }

    setStatus("start");
  }, []);

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

  async function restartFromBeginning() {
    //  are you sure?
    if (
      confirm(
        "Are you sure you want to restart from the beginning? You will lose all progress."
      )
    ) {
      await deleteConversation({ conversationId, surveyId });
    }
  }

  return (
    <Stack align="stretch">
      <ScrollArea h="78vh" offsetScrollbars viewportRef={scrollRef}>
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
      </ScrollArea>
      {status === "initial" ? (
        <Button onClick={startConversation}>Start conversation</Button>
      ) : status === "finish" ? (
        <Stack align="center">
          <Text>Thank you for your time!</Text>
          <Button onClick={restartFromBeginning} variant="outline">
            Restart from beginning
          </Button>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit} ref={formRef}>
          <Flex gap="sm">
            <Textarea
              value={input}
              placeholder="Send a message"
              onChange={handleInputChange}
              disabled={isLoading || status === "loading"}
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
          {isLoading || status === "loading" ? (
            <Text size="sm" c="dimmed">
              Loading...
            </Text>
          ) : null}
        </form>
      )}
    </Stack>
  );
}
