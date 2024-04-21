"use client";

import { Button } from "@mantine/core";
import { deleteSurvey } from "./action";
import { notifications } from "@mantine/notifications";

export default function DeleteSurveyButton({ surveyId }: { surveyId: string }) {
  return (
    <Button
      color="red"
      variant="outline"
      onClick={async () => {
        if (confirm("Are you sure you want to delete this survey?")) {
          const res = await deleteSurvey({ id: surveyId });

          if (!res) {
            return;
          }

          const { data, validationErrors, serverError } = res;

          if (validationErrors || serverError) {
            notifications.show({
              title: "Error",
              message: "Error deleting survey",
              color: "red",
            });
            return;
          }

          if (data?.failure) {
            notifications.show({
              title: "Error",
              message: data.failure,
            });
          }
        }
      }}
    >
      Remove Survey
    </Button>
  );
}
