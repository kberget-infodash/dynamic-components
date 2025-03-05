import { useState, useEffect } from "react";
import { InfodashApiClient } from "../services/infodash.api";
import { ServiceScope } from "@microsoft/sp-core-library";
import CacheService from "../services/cache.api";

/**
 * Custom hook to fetch SQL connections from Infodash API.
 * @param {ServiceScope} serviceScope - The SharePoint service scope.
 * @returns {{ connections: any[]; loading: boolean; error: string | null }}
 */

export type UseWeatherResult = {
  weather: any;
  loading: boolean;
  error: string | undefined;
};


export function useWeather(serviceScope: ServiceScope, location: string): UseWeatherResult {
  const [weather, setWeather] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();
  const _cache: CacheService = new CacheService();

  useEffect(() => {
    const apiClient = new InfodashApiClient(serviceScope);

    const fetchWeather = async (): Promise<void> => {
      try {
        const data: any = await _cache.withCache(`${location?.toLowerCase()}_weather`, async () => {
          return await apiClient.getWeatherByLocation(location);
        })

        setWeather(data);
      } catch (err) {
        console.error("Error getting SQL Connections", err);
        setError((err as Error).message || "Failed to fetch SQL connections");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather()
      .then(() => {
        console.log("Weather fetched successfully");
      })
      .catch((err) => {
        console.error("Error fetching weather", err);
      });
  }, [serviceScope]);

  return { weather, loading, error };
}
