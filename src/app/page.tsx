// import { LoginLink } from "@kinde-oss/kinde-auth-nextjs";
// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Container } from "@mantine/core";
import { redirect } from "next/navigation";

export default async function Home() {
  const { isAuthenticated } = getKindeServerSession();

  console.log(await isAuthenticated());

  if (!(await isAuthenticated())) {
    redirect("/api/auth/login?post_login_redirect_url=/");
  }

  return <Container></Container>;
}
