import RelicTrigger from "../Trigger";
import { FlamelCross } from "../emblems";

/** The Flamel cross from Ed's coat, pinned where the story ends. */
export const Trigger = (props) => <RelicTrigger id="alchemy" emblem={({ className }) => <FlamelCross className={className} />} {...props} />;
