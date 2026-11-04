import RelicTrigger from "../Trigger";
import { PokeBall } from "../emblems";

/** A Poké Ball at the start of the career timeline, waiting to be thrown. */
export const Trigger = (props) => <RelicTrigger id="pokeball" emblem={({ className }) => <PokeBall className={className} />} {...props} />;
