/* eslint-disable @typescript-eslint/no-explicit-any */
import { WebPartContext } from "@microsoft/sp-webpart-base";
import IUser, { IInfodashConfiguration } from "dynamic-component-library/lib/interfaces";

export interface IDynamicComponentDebuggerProps {
  context: WebPartContext;
  config: IInfodashConfiguration;
  data: any;
  user: IUser;
  trackEvent?: (eventName: string, properties?: any) => void;
  trackException?: (error: Error, properties?: any) => void;
}
