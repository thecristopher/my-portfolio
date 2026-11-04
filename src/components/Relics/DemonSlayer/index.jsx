import RelicTrigger from "../Trigger";
import { NichirinBlade } from "../emblems";

/** Tanjiro's Nichirin blade, resting by the certifications. */
export const Trigger = (props) => <RelicTrigger id="hanafuda" emblem={({ className }) => <NichirinBlade className={className} />} {...props} />;
