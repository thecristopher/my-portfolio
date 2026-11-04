import RelicTrigger from "../Trigger";
import { AirbenderArrow } from "../emblems";

/** Aang's arrow, pointing at the first case study. */
export const Trigger = (props) => <RelicTrigger id="airbender" emblem={({ className }) => <AirbenderArrow className={className} />} {...props} />;
