import RelicTrigger from "../Trigger";
import { UmbrellaLogo } from "../emblems";

/** The Umbrella logo, beside the company that really was called Umbrella. */
export const Trigger = (props) => <RelicTrigger id="umbrella" emblem={({ className }) => <UmbrellaLogo className={className} />} {...props} />;
