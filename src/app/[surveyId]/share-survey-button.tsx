"use client";

import { Button, CopyButton } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";

export default function ShareSurveyButton({ surveyId }: { surveyId: string }) {
  return (
    <CopyButton
      value={`${typeof window !== "undefined" ? window.location.origin : ""}/${surveyId}/view`}
    >
      {({ copied, copy }) => (
        <Button
          color={copied ? "teal" : "brand"}
          onClick={copy}
          variant="subtle"
          leftSection={
            copied ? (
              <IconCheck style={{ width: 16 }} />
            ) : (
              <IconCopy style={{ width: 16 }} />
            )
          }
        >
          {copied ? "Link Copied!" : "Copy Survey Link"}
        </Button>
      )}
    </CopyButton>
  );
}
