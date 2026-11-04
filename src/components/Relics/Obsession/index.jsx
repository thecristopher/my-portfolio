import RelicTrigger from "../Trigger";
import { WillowTwig } from "../emblems";

/** The One Wish Willow, a twig beside the email button. Once the wish is made it stays snapped in two. */
export const Trigger = (props) => <RelicTrigger id="willow" emblem={({ isFound, className }) => <WillowTwig isSnapped={isFound} className={className} />} {...props} />;
