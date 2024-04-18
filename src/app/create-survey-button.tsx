"use client";

import { Button, Text, Modal, Stack, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateSurveyButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    initialValues: {
      surveyDescription: "",
    },

    validate: {
      surveyDescription: (value) =>
        value.length < 10 ? "Survey description is too short" : null,
    },
  });

  function createSurvey(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (form.validate().hasErrors) return;
    setIsLoading(true);
    fetch("/api/survey", {
      method: "POST",
      body: JSON.stringify({
        surveyDescription: form.values.surveyDescription,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          notifications.show({
            title: "Error",
            message: data.message,
            color: "red",
          });
          return;
        }

        await router.push(`/${data.id}/edit`);
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Create New Survey"
        closeOnClickOutside={false}
        centered
      >
        <Stack>
          <Textarea
            label="What the survey is about?"
            description="Describe the problem or topic your survey will explore. This helps the AI to generate a survey form that fits your needs."
            autosize
            minRows={2}
            {...form.getInputProps("surveyDescription")}
          />
          <Button onClick={createSurvey} loading={isLoading}>
            Continue
          </Button>
          {isLoading ? (
            <Text fz="sm" c="dimmed">
              Generating....
            </Text>
          ) : null}
        </Stack>
      </Modal>
      <Button onClick={open} loading={isLoading}>
        New Survey
      </Button>
    </>
  );
}
