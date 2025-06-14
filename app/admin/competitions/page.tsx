import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchAllCompetitionsServer } from "@/services/competitionService";
import { CompetitionsClient } from "./competitions-client";

export default async function CompetitionsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // TODO: Check if user is admin
  // if (!isAdmin) {
  //   redirect("/");
  // }

  const competitions = await fetchAllCompetitionsServer();

  return <CompetitionsClient competitions={competitions} />;
}
