/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import type { IDynamicComponentDebuggerProps } from "./IDynamicComponentDebuggerProps";
import * as ComponentLibrary from "dynamic-component-library";
import styles from "./DynamicComponentDebugger.module.scss";

export const DynamicComponentDebugger: React.FC<
  IDynamicComponentDebuggerProps
> = (props) => {
  const { context, config, user, data } = props;

  return (
    <div className={styles.dynamicComponentDebugger}>
      <ComponentLibrary.Badge
        context={context}
        serviceScope={context.serviceScope}
        user={user}
        config={config}
        morningMessage="Good Morning"
        afternoonMessage="Good Afternoon"
        eveningMessage="Good Evening"
        nightMessage="Good Night"
        trackEvent={() => {}}
        trackException={() => {}}
      />

      <ComponentLibrary.TimezoneClock
        context={context}
        serviceScope={context.serviceScope}
        user={user}
        config={config}
        timeZones={data?.timezones}
        trackEvent={() => {}}
        trackException={() => {}}
      />
    </div>
  );
};
