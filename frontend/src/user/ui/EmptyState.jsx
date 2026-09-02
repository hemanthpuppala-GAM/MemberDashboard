export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(168,185,160,0.15)] text-[var(--color-blue-dark)]">
          <Icon size={22} />
        </div>
      )}
      <div>
        <p className="text-[14px] font-semibold text-[var(--color-ink)]">{title}</p>
        {description && <p className="mt-1 max-w-xs text-[13px] text-[var(--color-ink-soft)]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
