/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { type IPropertyPaneConfiguration } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { CacheService } from "../../services/cache.api";
import * as strings from "DynamicComponentDebuggerWebPartStrings";
import { DynamicComponentDebugger } from "./components/DynamicComponentDebugger";
import { IDynamicComponentDebuggerProps } from "./components/IDynamicComponentDebuggerProps";

export interface IDynamicComponentDebuggerWebPartProps {}

export default class DynamicComponentDebuggerWebPart extends BaseClientSideWebPart<IDynamicComponentDebuggerWebPartProps> {
  private config: any;
  private user: any;
  private _cache: CacheService = new CacheService();
  private configMapping: any;
  private data: Record<string, any>;

  // Importing all of your JSON data here
  private timezones: any = require("./data/timezones.json");

  protected async onInit(): Promise<void> {
    await super.onInit();

    /*
     * This is where you load your sample data from JSON files for use in components for testing.
    We are using require to load the JSON files as modules. This will allow us to use the data in our components.
     */

    setTimeout(() => {
      this.data = {
        timezones: this.timezones,
      };
      this.render();
    }, 1500);

    /**
     * This will get your configuration from your browsers cache. This is looking for a config and settings that are already defined.
     * Ensure that you use a debug page that has already had Infodash successfully loaded on it. e.g. Page.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/manifests.js
     */
    this.configMapping = this._cache.getCacheItem("config_mapping");

    const configName: string =
      this.configMapping[this.context.pageContext.site.absoluteUrl];
    this.config = this._cache.getCacheItem(`${configName}_configuration`);

    /**
     * This will get your user object from your browsers cache. This is looking for a currentuser to be already defined.
     * Ensure that you use a debug page that has already had Infodash successfully loaded on it. e.g. Page.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/manifests.js
     */
    this.user = this._cache.getCacheItem("currentuser");
  }

  public render(): void {
    const element: React.ReactElement<IDynamicComponentDebuggerProps> =
      React.createElement(DynamicComponentDebugger, {
        context: this.context,
        trackEvent: (eventName: string, properties?: any) => {
          console.log(eventName, properties);
        },
        trackException: (error: Error, properties?: any) => {
          console.error(error, properties);
        },
        config: this.config,
        data: this.data,
        user: this.user,
      });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [],
        },
      ],
    };
  }
}
