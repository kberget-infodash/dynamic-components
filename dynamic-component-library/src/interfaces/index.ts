/* eslint-disable @typescript-eslint/no-explicit-any */
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ServiceScope } from "@microsoft/sp-core-library";

export interface IInfodashBaseProps {
  config: any;
  user: any;
  context: WebPartContext;
  serviceScope: ServiceScope;
  trackEvent(eventName: string, properties?: any): void;
  trackException(exception: IExceptionTelemetry): void;
}

/**
 * @export
 * @interface IExceptionTelemetry
 * @description Exception interface used as primary parameter to trackException
 */
export interface IExceptionTelemetry {
  /**
   * Unique guid identifying this error
   */
  id?: string;
  /**
   * @deprecated
   * @type {Error}
   * @memberof IExceptionTelemetry
   * @description DEPRECATED: Please use exception instead. Behavior/usage for exception remains the same as this field.
   */
  error?: Error;
  /**
   * @type {Error}
   * @memberof IExceptionTelemetry
   * @description Error Object(s)
   */
  exception?: Error;
  /**
   * @description Specified severity of exception for use with
   * telemetry filtering in dashboard
   * @type {(SeverityLevel | number)}
   * @memberof IExceptionTelemetry
   */
  severityLevel?: SeverityLevel | number;

  /**
   * Property bag to contain additional custom properties (Part C)
   */
  properties?: {
    [key: string]: any;
  };
  /**
   * Property bag to contain additional custom measurements (Part C)
   * @deprecated -- please use properties instead
   */
  measurements?: {
    [key: string]: number;
  };
}

export declare enum SeverityLevel {
  Verbose = 0,
  Information = 1,
  Warning = 2,
  Error = 3,
  Critical = 4,
}

export interface ITheme {
  themeLight: string;
  themeTertiary: string;
  black: string;
  neutralSecondary: string;
  neutralTertiaryAlt: string;
  themeSecondary: string;
  themeDarker: string;
  neutralQuaternary: string;
  neutralPrimaryAlt: string;
  neutralPrimary: string;
  themeDark: string;
  themeLighter: string;
  neutralTertiary: string;
  neutralQuaternaryAlt: string;
  themeLighterAlt: string;
  white: string;
  neutralLighter: string;
  neutralLight: string;
  neutralDark: string;
  themeDarkAlt: string;
  neutralLighterAlt: string;
  themePrimary: string;
}

export interface IInfodashConfiguration {
  [x: string]: any;
}

export interface ISPUser {
  AboutMe?: string[];
  AccountName: string;
  Assistant?: any;
  Availability?: string;
  Birthday?: Date;
  Department?: string;
  DirectReports?: string | string[];
  DisplayName: string;
  WorkEmail?: string;
  ExtendedManagers?: string | string[];
  ExtendedReports?: string | string[];
  IsFollowed?: boolean;
  FirstName?: string;
  HireDate?: Date;
  HomePhone?: string;
  Initials: string;
  Title: string;
  LastName?: string;
  Location?: string;
  Manager?: any;
  CellPhone?: string;
  Office?: string;
  Peers?: string | string[];
  PhoneticFirstName?: string;
  PhoneticLastName?: string;
  PictureUrl: string;
  PictureURL?: string;
  PreferredName?: string;
  Skills?: string[];
  Status?: string;
  UserName?: string;
  WebSite?: string;
  WorkPhone?: string;
  [x: string]: any;
}

export interface IUser extends ISPUser {
  IDSiteUserId?: number;
  IDLinkedIn?: string;
  IDTwitter?: string;
  IDFacebook?: string;
  IDYouTube?: string;
  IDAudiences?: string;
  IDCustomSort?: number;
  IDFloorPlanLink1?: string;
  IDFloorPlanLink2?: string;
  AadId?: string;
  "msOnline-ObjectId"?: string;
}

export interface IInfodashServiceEntry {
  uri: string;
  appId: string;
}

export interface IInfodashServiceDefinition {
  default: IInfodashServiceEntry;
  [x: string]: IInfodashServiceEntry;
}

/**
 * Interface defining the configuration options for the service
 * Centralizes all configurable parameters
 */
export interface IConfigServiceOptions {
  cacheTimeout: number; // Duration in minutes for cache validity
  configMappingKey: string; // Key used for localStorage
  apiVersion: string; // API version string (e.g., 'v1')
  maxRetries: number; // Maximum number of retry attempts for failed requests
  apiClientKey: string; // Key for storing API client configuration
  tenantSettingsKey: string; // Key for storing tenant-specific settings
}

export interface ICacheItem {
  data: any;
  expires: string;
}

/**
 * Interface defining a single configuration entry
 */
export interface IConfigEntry {
  id: number;
  name: string;
  configKey: string; // Unique identifier for the config entry
  configValue: string; // Value stored as string, parsed based on dataType
  dataType: string; // Type information for parsing (number, boolean, json, etc.)
  isDeprecated: boolean; // Flag for deprecated entries
  updatedOn: string;
  updatedBy: string;
}

/**
 * Interface for the API response structure
 */
export interface IConfigResponse {
  defaultConfigs: Array<IConfigEntry>; // Default configuration entries
  configs: Array<IConfigEntry>; // Site-specific configuration entries
  configName: string; // Name of the configuration set
}

export interface IStorageEntity {
  Value: string | undefined;
  Comment: string | undefined;
  Description: string | undefined;
}

/**
 * Interface defining a single configuration entry
 */
export interface IConfigEntry {
  id: number;
  name: string;
  configKey: string; // Unique identifier for the config entry
  configValue: string; // Value stored as string, parsed based on dataType
  dataType: string; // Type information for parsing (number, boolean, json, etc.)
  isDeprecated: boolean; // Flag for deprecated entries
  updatedOn: string;
  updatedBy: string;
}

export interface ISQLRequest {
  connectionName: string;
  schema: string;
  actionType: string;
  parameters: {
    name: string;
    value: string;
  }[];
}

export default IUser;
