"use client";

import { Survey } from "@/lib/drizzle/schema";
import { Badge, Paper, Stack, Text } from "@mantine/core";
import Link from "next/link";

export default function ItemSurvey({ survey }: { survey: Survey }) {
  return (
    <Paper
      withBorder
      py="sm"
      px="md"
      component={Link}
      bg="gray.0"
      href={`/${survey.id}`}
    >
      <Stack gap="xs">
        <Text>{survey.title}</Text>
        <Badge variant="dot" color={survey.isActive ? "green" : "red"}>
          {survey.isActive ? "Active" : "Inactive"}
        </Badge>
      </Stack>
    </Paper>
  );
}
