// A project window: name, code/live links, tag pills, a 16:10 screenshot, and the
// description. The screenshot renders from its S3 key (uploaded in the editor,
// ADR-008); with no image the slot stays empty.
import { imageUrl } from "../lib/api";
import { useContent } from "../lib/useContent";

export function Work({ projectId }: { projectId: string }) {
  const project = useContent().projects.find((p) => p.id === projectId);
  if (!project) return null;

  return (
    <>
      <div className="mb-[14px] flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="m-0 font-display font-bold tracking-[-0.02em] text-[clamp(22px,3vw,30px)]">
          {project.name}
        </h1>
        <span className="flex gap-[14px] font-mono text-xs">
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noopener">
              code ↗
            </a>
          )}
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener" className="text-moss">
              live ↗
            </a>
          )}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-[7px]">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-line px-[9px] py-[3px] font-mono text-[11px] text-fg-dim"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mb-4 aspect-[16/10] w-full overflow-hidden rounded-[12px] border border-line bg-bg3">
        {project.image && (
          <img
            src={imageUrl(project.image)}
            alt={`${project.name} screenshot`}
            className="size-full object-cover"
          />
        )}
      </div>

      <p className="m-0 text-[15px] leading-[1.7] text-fg-dim">{project.desc}</p>
    </>
  );
}
