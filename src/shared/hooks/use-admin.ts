import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { isUserAdmin } from "@/(pages)/user/(server)/admin.actions";

export function useAdmin() {
  const { userId } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!userId) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const adminStatus = await isUserAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [userId]);

  return { isAdmin, isLoading };
}
