import { motion } from "framer-motion";
import { MAGIC_BLUE, MAGIC_PINK, cardSetCode, monsterLevel } from "../../lib/magic";
import { easeOutExpo } from "../../lib/motion";

// the colors of a printed effect monster: the orange frame, the bronze bevels and the cream text box
const FRAME = "linear-gradient(160deg, #e0894a 0%, #c8642c 45%, #a9481f 100%)";
const BEVEL = "#6b4a22";
const PARCHMENT = "#f1e6c8";
const INK = "#1a120a";
const LEVEL_RED = "#d8352a";
const STAR_GOLD = "#ffd54a";
const DARK_ORB = "radial-gradient(circle at 35% 30%, #b86bdc, #5b1e86 60%, #2c0b47)";

// a gold star on a red disc, the level marker printed under every monster's name
const LevelStar = () => (
  <span className="grid size-4 place-items-center rounded-full border text-[9px] leading-none" style={{ background: LEVEL_RED, borderColor: INK, color: STAR_GOLD }}>
    ★
  </span>
);

const NameBar = ({ title, isLead }) => (
  <div
    className="flex items-center justify-between gap-2 rounded-sm border-2 px-2 py-1"
    style={{ borderColor: BEVEL, background: "linear-gradient(to bottom, #f3d8b8, #d9a878)" }}
  >
    <h3 className={`truncate font-serif font-bold tracking-wide uppercase ${isLead ? "text-xl sm:text-2xl" : "text-sm"}`} style={{ color: INK }}>
      {title}
    </h3>
    {/* the DARK attribute orb, the same one Dark Magician Girl carries */}
    <span className="grid size-6 shrink-0 place-items-center rounded-full border font-serif text-[11px] font-bold text-white" style={{ background: DARK_ORB, borderColor: INK }}>
      闇
    </span>
  </div>
);

const Artwork = ({ Icon, isLead }) => (
  <div
    className={`grid place-items-center overflow-hidden border-4 ${isLead ? "flex-1 py-10" : "aspect-[4/3]"}`}
    style={{
      borderColor: BEVEL,
      background: `radial-gradient(circle at 50% 40%, ${MAGIC_PINK}66, transparent 55%), linear-gradient(160deg, #24124a, #0d0820 70%, ${MAGIC_BLUE}55)`,
    }}
  >
    {Icon && (
      <Icon
        aria-hidden="true"
        className={isLead ? "size-28 sm:size-40" : "size-16"}
        style={{ color: "#fdf3ff", filter: `drop-shadow(0 0 12px ${MAGIC_PINK})` }}
      />
    )}
  </div>
);

const TextBox = ({ skill, buff }) => (
  <div className="flex flex-col gap-1.5 rounded-sm border-2 px-2.5 py-2 font-serif" style={{ background: PARCHMENT, borderColor: BEVEL, color: INK }}>
    <p className="text-[11px] font-bold">[Spellcaster / Effect]</p>
    <p className="text-[12px] leading-snug text-pretty">{skill.effect}</p>
    <p className="mt-1 flex justify-end gap-3 border-t pt-1 text-[11px] font-bold tabular-nums" style={{ borderColor: INK }}>
      <span>
        ATK/{skill.attack + buff}{" "}
        <span className="rounded-sm px-1 text-white" style={{ background: `linear-gradient(to right, ${MAGIC_PINK}, ${MAGIC_BLUE})` }}>
          +{buff}
        </span>
      </span>
      <span>DEF/{skill.defense}</span>
    </p>
  </div>
);

/**
 * A skill printed as a real Yu-Gi-Oh effect monster: name and attribute, level stars, framed art, set code, the
 * effect text and ATK/DEF with Dark Magician Girl's buff on top.
 * @param {{ skill: { title: string, effect: string, attack: number, defense: number }, Icon?: Function, index: number, isLead?: boolean, buff: number }} props
 */
const DuelMonsterCard = ({ skill, Icon, index, isLead = false, buff }) => (
  <div
    className="h-full rounded-xl p-1.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]"
    style={{ background: "#141414", boxShadow: `0 0 0 1px ${MAGIC_PINK}55, 0 0 36px -6px ${MAGIC_PINK}66` }}
  >
    <div className="flex h-full flex-col gap-2 rounded-lg p-2.5 sm:p-3" style={{ background: FRAME }}>
      <NameBar title={skill.title} isLead={isLead} />
      <motion.div
        className="flex justify-end gap-0.5"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 + (index % 3) * 0.12, ease: easeOutExpo }}
        aria-label={`Level ${monsterLevel(skill.attack)}`}
      >
        {Array.from({ length: monsterLevel(skill.attack) }, (_, star) => (
          <LevelStar key={star} />
        ))}
      </motion.div>
      <Artwork Icon={Icon} isLead={isLead} />
      <p className="-mt-1 text-right font-serif text-[9px] font-bold" style={{ color: INK }}>
        {cardSetCode(index)}
      </p>
      <TextBox skill={skill} buff={buff} />
      <p className="flex justify-between font-serif text-[8px] font-bold" style={{ color: INK }}>
        <span>1st Edition</span>
        <span>©Cristopher</span>
      </p>
    </div>
  </div>
);

export default DuelMonsterCard;
