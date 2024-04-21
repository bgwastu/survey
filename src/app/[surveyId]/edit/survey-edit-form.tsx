"use client";

import { Survey } from "@/lib/drizzle/schema";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  NativeSelect,
  Overlay,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications, showNotification } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { updateSurvey } from "./action";

export default function SurveyEditForm({
  survey,
  // if the survey already has respondent, we cannot edit the initial form
  alreadyHasRespondent,
}: {
  survey: Survey;
  alreadyHasRespondent: boolean;
}) {
  const form = useForm({
    initialValues: {
      title: survey.title,
      description: survey.description,
      background: survey.background,
      objectives: survey.objectives,
      targetAudiences: survey.targetAudiences,
      preferredLanguages: survey.preferredLanguages.split(","),
    },
    validate: {
      title: (value) => (value.length < 3 ? "Title is too short" : null),
      background: (value) =>
        value.length < 3 ? "Background is too short" : null,
      objectives: (value) =>
        value.length < 3 ? "Objectives is too short" : null,
    },
    clearInputErrorOnChange: true,
  });

  const { execute, result } = useAction(updateSurvey);
  const [isLoading, setIsLoading] = useState(false);
  const [listInitialForm, setListInitialForm] = useState<InitialForm[]>(
    survey.initialFormJson ? JSON.parse(survey.initialFormJson) : []
  );

  useEffect(
    function showNotificationError() {
      if (result.data?.failure) {
        showNotification({
          title: "Error",
          message: result.data.failure,
          color: "red",
        });
      }
    },
    [result.data?.failure]
  );

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        setIsLoading(true);
        execute({
          ...values,
          preferredLanguages: values.preferredLanguages.join(","),
          id: survey.id,
          initialFormJson: alreadyHasRespondent
            ? survey.initialFormJson
            : JSON.stringify(listInitialForm),
        });
        setIsLoading(false);
      })}
    >
      <Stack>
        <input type="hidden" name="id" value={survey.id} />
        <TextInput
          name="title"
          label="Title"
          placeholder="Your survey title"
          required
          {...form.getInputProps("title")}
        />
        <TextInput
          name="description"
          label="Description"
          description="Concise description of the survey"
          placeholder="My survey is about..."
          required
          {...form.getInputProps("description")}
        />
        <Textarea
          name="background"
          label="Background"
          description="Concise background of the survey's context and the target audience"
          minRows={2}
          autosize
          placeholder="My survey is about..."
          rightSectionWidth={50}
          required
          {...form.getInputProps("background")}
        />
        <Textarea
          name="targetAudiences"
          label="Target Audiences"
          description="Who is the target audience for the survey?"
          minRows={2}
          autosize
          placeholder="Describe the target audience as detail as possible (age, gender, job title, location, education level, income level, etc)"
          rightSectionWidth={50}
          required
          {...form.getInputProps("targetAudiences")}
        />
        <Textarea
          name="objectives"
          label="Objectives"
          description="What are the objectives of the survey? List out 2-3 key things this survey should uncover"
          minRows={2}
          autosize
          placeholder="This survey aims to..."
          required
          rightSectionWidth={50}
          {...form.getInputProps("objectives")}
        />
        <TagsInput
          name="preferredLanguages"
          label="Preferred languages"
          required
          description="Select the languages you want to use in your survey conversation"
          {...form.getInputProps("preferredLanguages")}
        />
        <InitialFormSelect
          listInitialForm={listInitialForm}
          setListInitialForm={setListInitialForm}
          disabled={alreadyHasRespondent}
        />
        <Button variant="filled" type="submit" loading={isLoading}>
          Publish Survey
        </Button>
      </Stack>
    </form>
  );
}

type InitialForm = {
  title: string;
  type: "text" | "email" | "date" | "checkbox";
};

export function InitialFormSelect({
  listInitialForm,
  setListInitialForm,
  disabled,
}: {
  listInitialForm: InitialForm[];
  setListInitialForm: (initialForm: InitialForm[]) => void;
  disabled: boolean;
}) {
  const [currentInput, setCurrentInput] = useState<string>("");
  const [currentType, setCurrentType] = useState<
    "text" | "email" | "date" | "checkbox"
  >("text");
  return (
    <Box
      onClick={() => {
        if (disabled) {
          notifications.show({
            title: "Error",
            message:
              "Cannot add initial form because the survey already has respondent",
            color: "red",
          });
        }
      }}
    >
      <Stack>
        <Flex align="flex-end" gap="sm">
          <TextInput
            label="Initial Form"
            description="Add initial form for the survey. This form will showed up before conversation begin"
            placeholder="ex: Name, Email, Date of Birth, etc"
            flex={1}
            disabled={disabled}
            value={currentInput}
            onChange={(event) => setCurrentInput(event.currentTarget.value)}
          />
          <NativeSelect
            label="Type"
            data={[
              { value: "text", label: "Text" },
              { value: "email", label: "Email" },
              { value: "date", label: "Date" },
              { value: "checkbox", label: "Checkbox" },
            ]}
            value={currentType}
            disabled={disabled}
            onChange={(event) =>
              setCurrentType(event.currentTarget.value as any)
            }
          />
          <Button
            disabled={currentInput.trim() === "" || disabled}
            onClick={() => {
              // dont accept if the title is already in the list
              if (listInitialForm.some((item) => item.title === currentInput)) {
                notifications.show({
                  title: "Error",
                  message: "Title already exists",
                  color: "red",
                });
                return;
              }

              setListInitialForm([
                ...listInitialForm,
                {
                  title: currentInput,
                  type: currentType,
                },
              ]);
              setCurrentInput("");
            }}
          >
            Add
          </Button>
        </Flex>
      </Stack>
      {listInitialForm.length > 0 ? (
        <Stack gap="sm" my="sm">
          {listInitialForm.map((item, index) => (
            <Stack key={index} gap="xs">
              <Flex gap="xs" align="center" justify="space-between">
                <Flex gap="xs" align="center">
                  <Text c="dimmed">{index + 1}.</Text>
                  <Text>{item.title}</Text>
                  <Badge variant="light">
                    {item.type}
                  </Badge>
                </Flex>
                <ActionIcon
                  variant="white"
                  aria-label={`Remove ${item.title}`}
                  disabled={disabled}
                  onClick={() => {
                    setListInitialForm(
                      listInitialForm.filter((_, i) => i !== index)
                    );
                  }}
                  color="dark"
                >
                  <IconX style={{ width: "70%", height: "70%" }} />
                </ActionIcon>
              </Flex>
              <Divider />
            </Stack>
          ))}
        </Stack>
      ) : null}
    </Box>
  );
}
