"use client";

import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { toggleCloseSurvey } from "./action";
import { IconFlagCheck, IconFlagX } from "@tabler/icons-react";

export default function CloseSurveyButton({
  isSurveyActive,
  surveyId,
}: {
  isSurveyActive: boolean;
  surveyId: string;
}) {
  return (
    <Button
      color={isSurveyActive ? "red" : "green"}
      variant="subtle"
      leftSection={isSurveyActive ? <IconFlagX style={{ width: 16 }} /> : <IconFlagCheck style={{ width: 16 }} />}
      onClick={async () => {
        const res = await toggleCloseSurvey({ id: surveyId, currentStatus: isSurveyActive});

        if (!res) {
          return;
        }

        const { data, validationErrors, serverError } = res;

        if (validationErrors || serverError) {
          notifications.show({
            title: "Error",
            message: "Error closing survey",
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
      }}
    >
      {isSurveyActive ? "Close Survey" : "Activate Survey"}
    </Button>
  );
}
