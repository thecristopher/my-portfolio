const TerminalWindow = ({ title, children, className = "", bodyClassName = "p-5 sm:p-6" }) => (
  <div className={`overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] ${className}`}>
    <div className="flex items-center gap-2 border-b border-line bg-ink/40 px-4 py-3">
      <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
      <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
      <span className="size-2.5 rounded-full bg-[#28c840]/80" />
      <span className="ml-3 truncate font-mono text-[11px] text-faint">{title}</span>
    </div>
    <div className={bodyClassName}>{children}</div>
  </div>
);

export default TerminalWindow;
