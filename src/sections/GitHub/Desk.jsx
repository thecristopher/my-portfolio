import { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { deviceFor } from "./actions";
import { useTypist } from "./useTypist";
import { Laptop, Monitor, Phone } from "./Devices";
import { Mug, NightWindow } from "./Props";

// the screen is all but settled here, so the typing starts on a screen you can read instead of one still moving
const STARTS_TYPING_AT = 0.78;

const DEVICES = { monitor: Monitor, laptop: Laptop, phone: Phone };

// how much of the room the desk top takes for each device: deep enough for the keyboard and mouse in front of the
// monitor, a shallow ledge under the phone
const DESK_TOP = { monitor: "h-[30%]", laptop: "h-[16%]", phone: "h-[10%]" };

// the room the desk sits in: always night, whatever theme the rest of the page is in. the ultrawide fills the wall, so
// the window only shows behind the laptop
const Room = ({ device }) => (
  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,#2a2333_0%,#121019_55%,#0a090e_100%)]" />
    <NightWindow className="absolute top-[7%] right-[6%] hidden w-[18%] max-w-56 opacity-90 sm:block lg:hidden" />
    {/* the desk top, lit along its back edge by the screen */}
    <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-b from-[#3b2618] via-[#2a1a10] to-[#160d07] ${DESK_TOP[device]}`}>
      <span className="absolute inset-x-0 top-0 h-px bg-[#7a5236]/60" />
    </div>
  </div>
);

// which device fits the screen it's being read on
const useDevice = () => {
  const isWide = useMediaQuery("(min-width: 1024px)");
  const isMedium = useMediaQuery("(min-width: 640px)");
  return deviceFor(isWide, isMedium);
};

/**
 * The config I live in, on my desk at night, on the device that matches the screen it's read on: an ultrawide with
 * its keyboard and mouse on a wide screen, a laptop on a medium one and an iPhone on a phone. It comes alive as it
 * scrolls in, the editor types the features out and every keystroke lights its key, next to a mug that's still steaming.
 */
const Desk = () => {
  const ref = useRef(null);
  const device = useDevice();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const [isOn, setIsOn] = useState(() => scrollYProgress.get() >= STARTS_TYPING_AT);
  useMotionValueEvent(scrollYProgress, "change", (value) => value >= STARTS_TYPING_AT && setIsOn(true));
  const typed = useTypist(isOn);
  const Device = DEVICES[device];

  return (
    <div ref={ref} className="relative isolate overflow-hidden rounded-[2rem] px-5 pt-12 pb-[8%] ring-1 ring-line sm:px-10 sm:pt-20 sm:pb-[6%] lg:px-14 lg:pt-16 lg:pb-[4%]">
      <Room device={device} />
      {/* only the monitor leaves room on the desk for the mug, beside the mouse */}
      {device === "monitor" && <Mug className="absolute right-[4%] bottom-[6%] z-30 h-[min(15rem,22%)]" />}
      <Device progress={scrollYProgress} typed={typed} />
    </div>
  );
};

export default Desk;
