import { useState, useEffect } from "react";
import { InfodashGraphClient } from "../services/graph.api";
import { ServiceScope } from "@microsoft/sp-core-library";
import { IGraphUser } from "../interfaces/IGraph";
import CacheService from "../services/cache.api";

/**
 * Custom hook to fetch user details from Microsoft Graph.
 * @param {ServiceScope} serviceScope - The SharePoint service scope.
 * @returns {{ userDetails: any | null; loading: boolean; error: string | null }}
 */

export type UseGraphUserDetailsResult = {
  userDetails: IGraphUser | undefined;
  loading: boolean;
  error: string | undefined;
};

export function useGraphUserDetails(serviceScope: ServiceScope): UseGraphUserDetailsResult {
  const [userDetails, setUserDetails] = useState<IGraphUser | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();
  const _cache: CacheService = new CacheService();

  useEffect(() => {
    const graphClient = new InfodashGraphClient(serviceScope);

    const fetchUserDetails = async (): Promise<void> => {
      try {
        const data = await _cache.withCache("graphUserDetails", async () => {
          return graphClient.getMyDetails();
        });

        setUserDetails(data);
      } catch (err) {
        console.error("Error getting user details", err);
        setError((err as Error).message || "Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails()
      .then(() => {
        console.log("User details fetched successfully");
      })
      .catch((err) => {
        console.error("Error fetching user details", err);
      });
  }, [serviceScope]);

  return { userDetails, loading, error };
}
