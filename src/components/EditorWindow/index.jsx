import FileIcon from "../FileIcon";

/**
 * An nvim split in Apple's materials: rounded glass, the dropbar breadcrumbs as its winbar and a gutter of line
 * numbers down the left. The gutter counts the lines it's given, so wrapped text still lines up.
 * @param {{ path: string[], lines?: number, mode?: string, className?: string, children: React.ReactNode }} props
 */
const EditorWindow = ({ path, lines = 0, className = "", children }) => {
  const fileName = path.at(-1);
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-line-strong bg-mantle/85 shadow-[0_40px_100px_-40px_color-mix(in_oklab,var(--color-shadow)_90%,transparent)] backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-line bg-panel/60 px-4 py-2.5 font-mono text-[11px]">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-error/70" />
          <span className="size-2.5 rounded-full bg-peach/70" />
          <span className="size-2.5 rounded-full bg-string/70" />
        </span>
        {/* dropbar's breadcrumbs, the region's gold between each step */}
        <span className="ml-2 flex min-w-0 items-center gap-1.5 truncate text-faint">
          {path.map((step, index) => (
            <span key={step} className="flex items-center gap-1.5">
              {index > 0 && <span className="text-accent">›</span>}
              {index === path.length - 1 ? (
                <span className="flex items-center gap-1.5 text-fg">
                  <FileIcon name={fileName} size={11} />
                  {step}
                </span>
              ) : (
                step
              )}
            </span>
          ))}
        </span>
      </div>
      <div className="flex">
        {lines > 0 && (
          <ol className="hidden shrink-0 border-r border-line py-4 pr-3 pl-4 text-right font-mono text-[12px] leading-[1.75] text-faint select-none sm:block" aria-hidden="true">
            {Array.from({ length: lines }, (_, index) => (
              <li key={index} className={index === 0 ? "text-accent" : ""}>
                {index + 1}
              </li>
            ))}
          </ol>
        )}
        <div className="min-w-0 flex-1 p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
};

export default EditorWindow;
