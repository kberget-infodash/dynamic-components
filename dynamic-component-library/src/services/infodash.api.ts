import {
  AadHttpClient,
  AadHttpClientFactory,
  HttpClientResponse,
  IHttpClientOptions,
} from "@microsoft/sp-http";
import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
import { IInfodashServiceDefinition, ISQLRequest } from "../interfaces";
import CacheService from "./cache.api";
import { IStorageEntity, Web } from "@pnp/sp/webs";
import { SPFI } from "@pnp/sp";
import { getSP } from "./pnp.api";
import "@pnp/sp/webs";

export class InfodashApiClient {
  private cache = new CacheService();
  private aadHttpClientFactory: AadHttpClientFactory;
  /**
   * Store API endpoint information
   */
  private INFODASH_API_APP_SERVICE: string;
  private INFODASH_API_APP_REG_CLIENT_ID: string;
  private INFODASH_SVC_CONFIG: IInfodashServiceDefinition;
  private sp: SPFI;

  /**
   * Local reference to the page scope
   */
  private pageContext: PageContext;
  public static readonly serviceKey: ServiceKey<InfodashApiClient> =
    ServiceKey.create<InfodashApiClient>(
      "infodash:DynamicApiService",
      InfodashApiClient
    );

  constructor(serviceScope: ServiceScope) {
    serviceScope.whenFinished(() => {
      this.pageContext = serviceScope.consume(PageContext.serviceKey as any);
      this.aadHttpClientFactory = serviceScope.consume(
        AadHttpClientFactory.serviceKey as any
      );
      //   this.sp = spfi().using(SPFx(this.pageContext as any));
      this.sp = getSP(this.pageContext as any, "DynamicApiService");

      this.getAPIUrl().then(() => {
        console.log("Infodash API URL fetched successfully");
      })
      .catch((err) => {
        console.error("Error fetching Infodash API URL", err);
      });
    });
  }

  /**
   * Execute SQL Stored Procedure
   */
  public async getSQLData(
    entity: string,
    request: ISQLRequest
  ): Promise<Response> {
    return this.post(`/api/v1/data/sql/${entity}`, request);
  }

  /**
   * Get a list of avaialble SQL endpoints for a connection
   */
  public async getSQLEndpoints(connectionName?: string): Promise<Response> {
    return this.post(
      `/api/v1/data/sql`,
      connectionName ? [`connectionName=${connectionName}`] : []
    );
  }

  /**
   * Get a list of avaialble SQL endpoints for a connection
   */
  public async getSQLEndpointMetadata(
    entity: string,
    connectionName?: string
  ): Promise<Response> {
    return this.get(
      `/api/v1/data/sql/${entity}/meta`,
      connectionName ? [`connectionName=${connectionName}`] : []
    );
  }

  /**
   * Get a list of avaialble SQL endpoints for a connection
   */
  public async getSQLConnections(): Promise<Response> {
    return this.get(`/api/v1/data/sql/connections`);
  }

  public async getAPIUrl(): Promise<void> {
    try {
      const tenantSettingsCache: IInfodashServiceDefinition =
        this.cache.getCacheItem(`tenantsettings`) as IInfodashServiceDefinition;

      const url = this.pageContext.site.absoluteUrl?.toLowerCase();
      const web = Web([this.sp.web, url]);

      if (tenantSettingsCache) {
        this.INFODASH_SVC_CONFIG = tenantSettingsCache;
      } else {
        if (!this.INFODASH_SVC_CONFIG) {
          const entity: IStorageEntity = await web.getStorageEntity(
            "infodashcore"
          );
          if (!entity?.Value) {
            return Promise.reject(
              "Infodash API storage entity not found or is malformed. Make sure your Infodash Storage Entity is stored in the proper format. Read more here: https://acrowirellc.sharepoint.com/sites/InfodashPortal/SitePages/TenantStorageEntity.aspx"
            );
          } else {
            this.INFODASH_SVC_CONFIG = JSON.parse(entity.Value);
          }
        }
      }

      this.INFODASH_API_APP_SERVICE = this.INFODASH_SVC_CONFIG[url]
        ? this.INFODASH_SVC_CONFIG[url].uri
        : this.INFODASH_SVC_CONFIG.default.uri;

      this.INFODASH_API_APP_REG_CLIENT_ID = this.INFODASH_SVC_CONFIG[url]
        ? this.INFODASH_SVC_CONFIG[url].appId
        : this.INFODASH_SVC_CONFIG.default.appId;

      this.cache.setCacheItem(`tenantsettings`, this.INFODASH_SVC_CONFIG);

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getWeatherLocations(): Promise<Response> {
    return this.get(`/api/v1/weather`);
  }

  public async getWeatherByLocation(location: string): Promise<Response> {
    return this.get(`/api/v1/weather/${location}`);
  }

  /**
   * Makes a generic GET request.
   */
  private async get(endpoint: string, params?: string[]): Promise<Response> {
    try {
      await this.getAPIUrl();
      const aadHttpClient: AadHttpClient =
        await this.aadHttpClientFactory.getClient(
          this.INFODASH_API_APP_REG_CLIENT_ID
        );
      const clientResponse: HttpClientResponse = await aadHttpClient.get(
        `${this.INFODASH_API_APP_SERVICE}${endpoint}${
          params && params.length > 0 ? `?${params.join("&")}` : ""
        }`,
        AadHttpClient.configurations.v1,
        <IHttpClientOptions>{
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const data: any = await clientResponse.json();

      return Promise.resolve(data);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Makes a generic GET request.
   */
  private async post(endpoint: string, body?: any): Promise<Response> {
    try {
      await this.getAPIUrl();
      const aadHttpClient: AadHttpClient =
        await this.aadHttpClientFactory.getClient(
          this.INFODASH_API_APP_REG_CLIENT_ID
        );
      const clientResponse: HttpClientResponse = await aadHttpClient.post(
        `${this.INFODASH_API_APP_SERVICE}${endpoint}`,
        AadHttpClient.configurations.v1,
        <IHttpClientOptions>{
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );

      const data: any = await clientResponse.json();

      return Promise.resolve(data);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
