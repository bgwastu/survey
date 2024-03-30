import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Container, Stack, Title } from "@mantine/core";
import { redirect } from "next/navigation";
import Form from "./form";

// TODO: Make this page modular (create and edit)
export default async function Page() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login?post_login_redirect_url=/");
  }

  return (
    <Stack>
      <Title>Create New Survey</Title>
      <Form />
    </Stack>
  );
}
