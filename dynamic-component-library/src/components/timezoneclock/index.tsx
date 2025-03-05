import * as React from "react";
import "@pnp/sp/webs";
import { useState, useEffect } from "react";
import * as moment from "moment";
import styles from "./styles.module.scss";
import { IInfodashBaseProps } from "../../interfaces";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";



interface ITimeZone {
  label: string;
  offset: string;
}

export interface ITimezonProps extends IInfodashBaseProps {
  timeZones: Array<ITimeZone>;
}

const LoaderSkelley = (): JSX.Element => {
  return (
    <div className={styles.tz}>
      <Skeleton width={75} />
      <div className={styles.today}>
        <div className={styles.date}>
          <Skeleton width={75} height={150}/>
        </div>
        <div className={styles.zones}>
          {[1,2,3,4].map(() => {
            return (
              <Skeleton width={95} height={70}/>
            );
          })}
        </div>
      </div>
    </div>
  );
};


/**
 * The Timezone Clock component displays a list of time zones.
 *
 * @component
 * @description Displays a list of time zones with their current time.
 * @example
 * ```tsx
 * <TimezoneClock timeZones={[{ label: "EST", offset: "-5" }]} />
 * ```
 *
 * @param {ITimeZone[]} timeZones - Array of time zones to display.
 *
 * @typedef {Object} ITimeZone
 * @property {string} label - The name of the time zone (e.g., "Eastern Time").
 * @property {string} offset - The UTC offset (e.g., "-5").
 *
 * @returns {JSX.Element} The Timezone Clock component.
 */

export const TimezoneClock: React.FC<ITimezonProps> = ({
  timeZones,
}) => {
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeZones) {
    return <LoaderSkelley />;
  }

  return (
    <div className={styles.tz}>
      <div className={styles.today}>
        <div className={styles.date}>
          <div>{moment(currentTime).format("ddd")}</div>
          <div className={styles.num}>{moment(currentTime).format("DD")}</div>
          <div>{moment(currentTime).format("MMM")}</div>
          <div>{moment(currentTime).format("YYYY")}</div>
        </div>
        <div className={styles.zones}>
          {timeZones.map((tz, index) => {
            return (
              index < 4 && (
                <div className={styles.time} key={index}>
                  <div className={styles.label}>{tz.label}</div>
                  <div className={styles.clock}>
                    {moment(currentTime).utcOffset(Number(tz.offset)).format("h:mm a")}
                  </div>
                </div>
              )
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default TimezoneClock;
