import { Title } from "@mantine/core";
import { css } from "@/styled-system/css";

export default function Home() {
  return (
    <main>
      <Title
        className={css({
          color: "var(--mantine-color-brand-9)",
        })}
      >
        Hello World
      </Title>
    </main>
  );
}
