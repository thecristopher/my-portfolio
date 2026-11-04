import RelicTrigger from "../Trigger";
import { D20 } from "../emblems";
import { faceToShow, lastFace } from "./helpers";

/** The d20 beside the email address. Rolled once, it keeps showing the face it last landed on. */
export const Trigger = (props) => {
  const face = lastFace.use();
  return <RelicTrigger id="d20" emblem={({ isFound, className }) => <D20 face={faceToShow(isFound, face)} className={className} />} {...props} />;
};
