"use client";

import { Conversation } from "@/lib/drizzle/schema";
import { Badge, Box, Flex, Stack, Text } from "@mantine/core";
import ConversationPanel from "../conversation-panel";
import { useState } from "react";
import { InitialForm } from "@/lib/types";

export default function ResponseList({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);

  return (
    <Flex
      direction={{
        0: "column",
        md: "row",
      }}
      gap="sm"
    >
      <Stack>
        {conversations.map((c) => {
          return (
            <Text
              key={c.id}
              onClick={() => {
                setCurrentConversation(c);
              }}
              style={{
                cursor: "pointer",
              }}
            >
              {c.id}
            </Text>
          );
        })}
      </Stack>
      <Stack flex={1}>
        {currentConversation ? (
          <>
            {/* TODO: make it pretty~ */}
            <Text>Initial Form</Text>
            <>
              {currentConversation.initialFormDataJson && (
                <Text>
                  {JSON.stringify(currentConversation.initialFormDataJson)}
                </Text>
              )}
            </>
            <ConversationPanel
              messages={JSON.parse(currentConversation.chatHistoryJson)}
            />
          </>
        ) : (
          <Text>Select conversation</Text>
        )}
      </Stack>
    </Flex>
  );
}
