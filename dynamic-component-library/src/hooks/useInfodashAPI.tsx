import { useState, useEffect } from "react";
import { InfodashApiClient } from "../services/infodash.api";
import { ServiceScope } from "@microsoft/sp-core-library";

/**
 * Custom hook to fetch SQL connections from Infodash API.
 * @param {ServiceScope} serviceScope - The SharePoint service scope.
 * @returns {{ connections: any[]; loading: boolean; error: string | null }}
 */

export type UseInfodashAPIResult = {
  connections: any[];
  loading: boolean;
  error: string | undefined;
};

export function useInfodashAPI(serviceScope: ServiceScope): UseInfodashAPIResult {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const apiClient = new InfodashApiClient(serviceScope);

    const fetchConnections = async (): Promise<void> => {
      try {
        const data: any = await apiClient.getSQLConnections();

        setConnections(data);
      } catch (err) {
        console.error("Error getting SQL Connections", err);
        setError((err as Error).message || "Failed to fetch SQL connections");
      } finally {
        setLoading(false);
      }
    };

    fetchConnections()
      .then(() => {
        console.log("SQL Connections fetched successfully");
      })
      .catch((err) => {
        console.error("Error fetching SQL Connections", err);
      });
  }, [serviceScope]);

  return { connections, loading, error };
}
