import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { HttpClientResponse } from "@microsoft/sp-http";
import {
  MSGraphClientFactory,
  AadHttpClientFactory,
  AadHttpClient,
} from "@microsoft/sp-http";
import "@pnp/graph/users";

export class InfodashGraphClient {
  constructor(serviceScope: ServiceScope) {
    serviceScope.whenFinished(() => {
      this.aadHttpClientFactory = serviceScope.consume(
        AadHttpClientFactory.serviceKey
      );
      this.msGraphClientFactory = serviceScope.consume(
        MSGraphClientFactory.serviceKey
      );
    });
  }

  /**
   * Create our own ms graph clientservice instance
   */
  private msGraphClientFactory: MSGraphClientFactory;

  /**
   *
   */
  private aadHttpClientFactory: AadHttpClientFactory;

  /**
   * Local reference to the page scope
   */
  public static readonly serviceKey: ServiceKey<InfodashGraphClient> =
    ServiceKey.create<InfodashGraphClient>(
      "Infodash:DynamicGraphService",
      InfodashGraphClient
    );

  public async getPresenceForUser(aadId: string): Promise<any> {
    try {
      const aadHttpClient: AadHttpClient =
        await this.aadHttpClientFactory.getClient(
          "https://graph.microsoft.com"
        );
      const clientResponse: HttpClientResponse = await aadHttpClient.get(
        `https://graph.microsoft.com/beta/users/${aadId}/presence`,
        AadHttpClient.configurations.v1
      );

      return clientResponse.json();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getMyDetails(): Promise<any> {
    try {
      const requests = {
        requests: [
          {
            id: "1",
            method: "GET",
            url: "/me?$select=displayName,jobTitle,mail,userPrincipalName,givenName",
          },
          {
            id: "2",
            method: "GET",
            url: "/me/presence",
          },
        ],
      };

      const _msGraphClient = await this.msGraphClientFactory.getClient("3");
      const batchResults = await _msGraphClient.api("/$batch").post(requests);
      // const batchResults = await batch.json();
      const photo = await this.getGraphUserPhoto();
      const blob = new Blob([photo], { type: "image/jpeg" });
      const photoUrl = URL.createObjectURL(blob);

      if (!batchResults.responses) throw new Error("Batch response failed");

      const userDetails =
        batchResults.responses.find((r: any) => r.id === "1")?.body || {};
      const presence =
        batchResults.responses.find((r: any) => r.id === "2")?.body || {};

      const user = {
        ...userDetails,
        presence: presence.availability
          ? { availability: presence.availability, activity: presence.activity }
          : undefined,
        photoUrl,
      };

      return user;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async getGraphUserPhoto(): Promise<any> {
    try {
      const _msGraphClient = await this.msGraphClientFactory.getClient("3");
      const user = await _msGraphClient.api("/me/photo/$value").get();
      return user;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
