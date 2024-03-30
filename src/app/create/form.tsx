"use client";

import { useEffect, useState } from "react";
import { createSurvey } from "./action";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import {
  ActionIcon,
  Button,
  LoadingOverlay,
  Stack,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useFormState, useFormStatus } from "react-dom";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { IconBrandOpenai } from "@tabler/icons-react";

export default function Form() {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      title: "",
      background: "",
      objectives: "",
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

  const [state, formAction] = useFormState(createSurvey, null);
  useEffect(
    function showNotificationError() {
      if (state?.message) {
        showNotification({
          title: state.message.isError ? "Error" : "Information",
          color: state.message.isError ? "red" : undefined,
          message: state.message.text,
        });
      }
    },
    [state?.message]
  );

  return (
    <form action={formAction}>
      <LoadingOverlay visible={loading} />
      <Stack>
        <TextInput
          name="title"
          label="Title"
          placeholder="Your survey title"
          required
          error={state?.errors?.title}
          {...form.getInputProps("title")}
        />
        <Textarea
          name="background"
          label="Background"
          description="Concise background of the survey's context and the target audience"
          minRows={3}
          autosize
          placeholder="My survey is about..."
          rightSection={
            <Tooltip label="Improve background with AI">
              <ActionIcon
                variant="default"
                aria-label="Settings"
                onClick={async () => {
                  // if the title is empty, show error
                  if (!form.values.title) {
                    showNotification({
                      title: "Error",
                      message: "Please fill in the title first",
                      color: "red",
                    });
                    return;
                  }

                  // if the background < 3 words, show error
                  if (!form.getInputProps("background").value) {
                    showNotification({
                      title: "Error",
                      message: "Please fill in the background first.",
                      color: "red",
                    });
                    return;
                  }

                  setLoading(true);
                  const res = await fetch("/create/generated", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      title: form.values.title,
                      inputName: "background",
                      inputText: form.getInputProps("background").value,
                    }),
                  });
                  setLoading(false);

                  if (!res.ok) {
                    showNotification({
                      title: "Error",
                      message: "Failed to improve background.",
                      color: "red",
                    });
                    setLoading(false);
                    return;
                  }

                  const data = await res.json();
                  if (data.error) {
                    showNotification({
                      title: "Error",
                      color: "red",
                      message: data.error,
                    });
                  } else {
                    form.setFieldValue("background", data.text);
                  }
                }}
              >
                <IconBrandOpenai
                  style={{ width: "70%", height: "70%" }}
                  stroke={1.5}
                />
              </ActionIcon>
            </Tooltip>
          }
          rightSectionWidth={50}
          required
          error={state?.errors?.background}
          {...form.getInputProps("background")}
        />
        <Textarea
          name="objectives"
          label="Objectives"
          description="What are the objectives of the survey? List out 2-3 key things this survey should uncover"
          minRows={3}
          autosize
          placeholder="This survey aims to..."
          required
          rightSection={
            <Tooltip label="Improve objectives with AI">
              <ActionIcon
                variant="default"
                aria-label="Settings"
                onClick={async () => {
                  // if the title is empty, show error
                  if (!form.values.title) {
                    showNotification({
                      title: "Error",
                      message: "Please fill in the title first",
                      color: "red",
                    });
                    return;
                  }

                  // if the objective < 3 words, show error
                  if (
                    !form.values.objectives ||
                    form.values.objectives.split(" ").length < 3
                  ) {
                    showNotification({
                      title: "Error",
                      message: "Please fill in the objectives first.",
                      color: "red",
                    });
                    return;
                  }

                  setLoading(true);
                  const res = await fetch("/create/generated", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      title: form.values.title,
                      inputName: "objectives",
                      inputText: form.values.title,
                    }),
                  });
                  setLoading(false);

                  if (!res.ok) {
                    showNotification({
                      title: "Error",
                      message: "Failed to improve objective.",
                      color: "red",
                    });
                    setLoading(false);
                    return;
                  }

                  const data = await res.json();
                  if (data.error) {
                    showNotification({
                      title: "Error",
                      color: "red",
                      message: data.error,
                    });
                  } else {
                    form.setFieldValue("objectives", data.text);
                  }
                }}
              >
                <IconBrandOpenai
                  style={{ width: "70%", height: "70%" }}
                  stroke={1.5}
                />
              </ActionIcon>
            </Tooltip>
          }
          rightSectionWidth={50}
          error={state?.errors?.objectives}
          {...form.getInputProps("objectives")}
        />
        <SubmitButton />
      </Stack>
    </form>
  );
}

function SubmitButton() {
  const status = useFormStatus();

  return (
    <Button variant="filled" type="submit" loading={status.pending}>
      Create Survey
    </Button>
  );
}
