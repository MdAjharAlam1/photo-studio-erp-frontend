export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="px-8 py-4 border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {eyebrow && <div className="label-uppercase mb-1">{eyebrow}</div>}
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-zinc-500 mt-1 text-sm max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
