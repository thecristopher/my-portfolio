import RelicTrigger from "../Trigger";
import { Triforce } from "../emblems";

/** The Triforce, past the last side project. */
export const Trigger = (props) => <RelicTrigger id="triforce" emblem={({ className }) => <Triforce className={className} />} {...props} />;
