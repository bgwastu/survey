"use client";

import { InitialForm } from "@/lib/types";
import { camelize } from "@/lib/utils";
import {
  Stack,
  Title,
  Text,
  TextInput,
  Checkbox,
  Button,
  NativeSelect,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { updateInitialFormSurvey } from "./action";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export default function InitialFormView({
  initialFormList,
  surveyId,
  preferredLanguageList
}: {
  initialFormList: InitialForm[];
  surveyId: string;
  preferredLanguageList: string[];
}) {
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(function setInitialFingerprint() {
    FingerprintJS.load()
      .then((fp) => fp.get())
      .then((res) => {
        setFingerprint(res.visitorId);
        document.cookie = `fp=${res.visitorId}; path=/; max-age=31536000; SameSite=Lax`;
      });
  }, []);

  const form = useForm({
    initialValues: initialFormList.reduce(
      (acc: Record<string, string | null | boolean>, e) => {
        if (e.type === "date") {
          acc[e.id] = null;
        } else if (e.type === "checkbox") {
          acc[e.id] = false;
        } else {
          acc[e.id] = "";
        }
        return acc;
      },
      {
        preferredLanguage: preferredLanguageList[0],
      } as Record<string, string | null | boolean>
    ),
    validate: (values: any) => {
      return initialFormList.reduce(
        (acc: any, e) => {
          if (e.type === "email") {
            acc[e.id] = !values[e.id]?.includes("@") ? "Invalid email" : null;
          } else {
            acc[e.id] =
              values[e.id]?.length === 0 || values[e.id] === null
                ? "This field is required"
                : null;
          }
          return acc;
        },
        {} as Record<string, string | null | boolean>
      );
    },
  });

  return (
    <Stack>
      <Text>Before you start, please fill in the following information:</Text>
      <form
        onSubmit={form.onSubmit(async (values) => {
          if (!fingerprint) return;
          const { serverError, validationErrors } =
            await updateInitialFormSurvey({
              fingerprintId: fingerprint,
              data: values,
              surveyId,
            });

          if (serverError || validationErrors) {
            notifications.show({
              title: "Error",
              message: "There was an error submitting the form",
              color: "red",
            });
            return;
          }
        })}
      >
        <Stack>
          {initialFormList.map((e, index) => (
            <div key={index}>
              {e.type === "text" && (
                <TextInput
                  name={e.id}
                  label={e.title}
                  required
                  {...form.getInputProps(e.id)}
                />
              )}
              {e.type === "email" && (
                <TextInput
                  name={e.id}
                  label={e.title}
                  required
                  placeholder="john@example.com"
                  {...form.getInputProps(e.id)}
                />
              )}
              {e.type === "date" && (
                <DatePickerInput
                  name={e.id}
                  label={e.title}
                  required
                  placeholder="Select date"
                  {...form.getInputProps(e.id)}
                />
              )}
              {e.type === "checkbox" && (
                <Checkbox
                  name={e.id}
                  label={e.title}
                  {...form.getInputProps(e.id)}
                />
              )}
            </div>
          ))}
          <NativeSelect
            label="Preferred Language"
            description="Select your preferred language to conduct the survey"
            data={preferredLanguageList}
            {...form.getInputProps("preferredLanguage")}
          />
          <Button type="submit" loading={fingerprint === null}>
            Start Survey
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
