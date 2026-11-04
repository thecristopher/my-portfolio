import RelicTrigger from "../Trigger";
import { MillenniumPuzzle } from "../emblems";

/** The Millennium Puzzle, keeping watch over the skills. */
export const Trigger = (props) => <RelicTrigger id="magician" emblem={({ className }) => <MillenniumPuzzle className={className} />} {...props} />;
