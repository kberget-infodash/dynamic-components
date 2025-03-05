import * as React from "react";
import { IInfodashBaseProps } from "../../interfaces";
import styles from "./styles.module.scss";
import { useGraphPhoto } from "../../hooks/useGraphPhoto";
import * as moment from "moment";
import { useGraphUserDetails } from "../../hooks/useGraphUserDetails";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useWeather} from "../../hooks/useWeather";


export interface IBadgeProps extends IInfodashBaseProps {
  morningMessage: string;
  afternoonMessage: string;
  eveningMessage: string;
  nightMessage: string;
}


/**
 * Description: The badge component displays the user's photo, the current time, the user's name, and links to the user's profile and department.
 * Props: morningMessage: string, afternoonMessage: string, eveningMessage: string, nightMessage: string
 * Notes: The badge component uses the useGraphPhoto, useGraphUserDetails, and useWeather hooks to fetch the user's photo, user details, and weather information.
 */

export const Badge: React.FC<IBadgeProps> = ({
  config,
  user,
  serviceScope,
  morningMessage,
  afternoonMessage,
  eveningMessage,
  nightMessage,
}) => {
  const { photo, loading: photoLoading } = useGraphPhoto(serviceScope);
  const { weather } = useWeather(serviceScope, 'Arlington');
  const { userDetails, loading: userLoading } =
    useGraphUserDetails(serviceScope);
  const [currentTime, setCurrentTime] = React.useState(
    moment().format("h:mm a")
  );

  console.log("weather", weather);
  const LoaderSkelley = (): JSX.Element => {
    return (
      <div className={styles.badge}>
        <div className={styles.avatar}>
          <Skeleton circle={true} height={100} width={100} />
        </div>
        <div className={styles.content}>
          <div className={styles.subtitle}>
            <Skeleton width={200} />
          </div>
          <h2>
            <Skeleton />
          </h2>
          <div className={styles.links}>
            <ul>
              <li>
                <Skeleton width={100} />
              </li>
              <li>
                <Skeleton width={100} />
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().format("h:mm A"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  let greeting = "";
  const hour = moment().hour();
  if (hour >= 5 && hour < 12) {
    greeting = morningMessage;
  } else if (hour >= 12 && hour < 17) {
    greeting = afternoonMessage;
  } else if (hour >= 17 && hour < 21) {
    greeting = eveningMessage;
  } else {
    greeting = nightMessage;
  }

  if (photoLoading || userLoading) {
    return <LoaderSkelley />;
  }

  return (
    <div className={styles.badge}>
      <div className={styles.avatar}>
        <img src={photo} alt="User Avatar" />
      </div>
      <div className={styles.content}>
        <div className={styles.subtitle}>
          {[`56° CLOUDS`, currentTime, weather?.name].join(" • ")}
        </div>
        <h2>
          {greeting}, {userDetails?.givenName}!
        </h2>
        <div className={styles.links}>
          <ul>
            <li>
              <a href={config.UserProfilePageUrl}>My Profile</a>
            </li>
            <li>
              <a href={`${config.DepartmentPageUrl}?dept=${user.Department}`}>
                My Department
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
