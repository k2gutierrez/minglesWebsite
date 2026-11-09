"use client";

/**
 * The pixel barrel, shared by the hero and the stadium.
 *
 * One geometry, one look: the hero shows the same cask the player will see in
 * the arena, so the page announces the game with the game's own material.
 *
 * The fill is a share of the arena, not an absolute count. That is what keeps a
 * hundred players and a thousand players readable at the same size.
 */

export const SIZE = 240;
export const GRID = 20;
export const CELL = SIZE / GRID;
export const RADIUS = SIZE / 2 - 6;
export const SIDE = CELL * 0.88;

export const CELL_FIELD: { x: number; y: number }[] = (() => {
  const cells: { x: number; y: number }[] = [];
  for (let row = 0; row <= GRID; row += 1) {
    const y = row * CELL + CELL / 2;
    for (let column = -1; column <= GRID; column += 1) {
      const x = column * CELL + CELL / 2 + (row % 2 ? CELL * 0.5 : 0);
      if (Math.hypot(x - SIZE / 2, y - SIZE / 2) <= RADIUS - CELL * 0.38) {
        cells.push({ x, y });
      }
    }
  }
  cells.sort((a, b) => b.y - a.y || a.x - b.x);
  return cells;
})();

/** Cells lit for a given fill ratio, always at least one when there are players. */
export function litCells(fill: number, players: number): number {
  if (players <= 0) return 0;
  return Math.min(
    CELL_FIELD.length,
    Math.max(1, Math.round(fill * CELL_FIELD.length)),
  );
}

/**
 * A decorative barrel for the hero. Not interactive, no numbers: it is the
 * object the page is about, drawn the way the game draws it.
 */
export function PixelBarrel({
  fill = 0.62,
  className = "",
  label = "",
}: {
  fill?: number;
  className?: string;
  label?: string;
}) {
  const lit = litCells(fill, 1);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={label || "A barrel filled with pixel liquid"}
    >
      <circle
        className="mw-barrel-ring mw-barrel-ring-inner"
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS * 0.66}
      />
      {CELL_FIELD.map((cell, index) => (
        <rect
          key={index}
          className={index < lit ? "mw-cell is-on" : "mw-cell"}
          x={cell.x - SIDE / 2}
          y={cell.y - SIDE / 2}
          width={SIDE}
          height={SIDE}
          rx={0.7}
        />
      ))}
      <circle className="mw-barrel-ring" cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} />
    </svg>
  );
}
