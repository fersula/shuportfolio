import type { NodeType } from "@/lib/refraction-lab-data";

/**
 * The shape+animation for one node type — shared verbatim between the
 * filter legend (small, static context) and the starfield nodes, so the
 * legend is a literal key to what's floating on the right.
 */
export function NodeMarker({
  type,
  color,
  size = 16,
  opacity = 1,
  blur = 0,
}: {
  type: NodeType;
  color: string;
  size?: number;
  /** depth-of-field dimming — see DEPTH_LAYERS */
  opacity?: number;
  /** depth-of-field softening — see DEPTH_LAYERS */
  blur?: number;
}) {
  return (
    <span
      className="lab-marker"
      style={
        {
          "--lab-size": `${size}px`,
          "--lab-color": color,
          opacity,
          filter: blur ? `blur(${blur}px)` : undefined,
        } as React.CSSProperties
      }
    >
      <span className="lab-marker__glow" />
      {type === "question" && <span className="lab-marker__tri" />}
      {type === "observation" && <span className="lab-marker__dot" />}
      {type === "hypothesis" && <span className="lab-marker__ring" />}
      {type === "experiment" && (
        <span className="lab-marker__diamond-wrap">
          <span className="lab-marker__diamond" />
        </span>
      )}
    </span>
  );
}
