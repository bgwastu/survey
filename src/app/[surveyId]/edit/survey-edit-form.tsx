"use client";

import {
  Button,
  LoadingOverlay,
  Stack,
  TagsInput,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateSurvey } from "./action";
import { Survey } from "@/lib/drizzle/schema";

export default function SurveyEditForm({ survey }: { survey: Survey }) {
  const [loading, setLoading] = useState(false);

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

  const [state, formAction] = useFormState(updateSurvey, null);
  // useEffect(
  //   function showNotificationError() {
  //     if (state?.message) {
  //       showNotification({
  //         title: state.message.isError ? "Error" : "Information",
  //         color: state.message.isError ? "red" : undefined,
  //         message: state.message.text,
  //       });
  //     }
  //   },
  //   [state?.message]
  // );

  return (
    <form action={formAction}>
      <LoadingOverlay visible={loading} />
      <Stack>
        <input type="hidden" name="id" value={survey.id} />
        <TextInput
          name="title"
          label="Title"
          placeholder="Your survey title"
          required
          error={state?.errors?.title}
          {...form.getInputProps("title")}
        />
        <TextInput
          name="description"
          label="Description"
          description="Concise description of the survey"
          placeholder="My survey is about..."
          required
          error={state?.errors?.title}
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
          error={state?.errors?.background}
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
          error={state?.errors?.background}
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
          error={state?.errors?.objectives}
          {...form.getInputProps("objectives")}
        />
        <TagsInput
          name="preferredLanguages"
          label="Preferred languages"
          required
          description="Select the languages you want to use in your survey"
          {...form.getInputProps("preferredLanguages")}
        />
        {/* TODO: add proper form json */}
        <SubmitButton />
      </Stack>
    </form>
  );
}

function SubmitButton() {
  const status = useFormStatus();

  return (
    <Button variant="filled" type="submit" loading={status.pending}>
      Publish Survey
    </Button>
  );
}
