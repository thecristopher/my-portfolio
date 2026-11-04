import RelicTrigger from "../Trigger";
import { GraceSigil } from "../emblems";

/** The sigil of grace, where the page signs off. */
export const Trigger = (props) => <RelicTrigger id="grace" emblem={({ className }) => <GraceSigil className={className} />} {...props} />;
