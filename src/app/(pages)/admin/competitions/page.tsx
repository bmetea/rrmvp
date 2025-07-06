import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchAllCompetitionsServer } from "@/(pages)/competitions/(server)/competition.service";
import { CompetitionsClient } from "./competitions-client";
import { isUserAdmin } from "@/domains/admin/actions/admin.actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CompetitionsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user is admin
  if (!(await isUserAdmin())) {
    redirect("/");
  }

  const competitions = await fetchAllCompetitionsServer();

  return <CompetitionsClient competitions={competitions} />;
}
