"use client";
import {
  Fingerprint,
  FlaskConical,
  Gem,
  Layers,
  Milk,
  Orbit,
  Sprout,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

/**
 * Símbolos de tarjeta que el admin puede elegir.
 *
 * Lucide no trae un agave ni un cincel, y el cliente los pidió por su nombre
 * («Símbolo de la planta quiero que sea 1 AGAVE», «¿puede ser un cincel?»). Por
 * eso esos dos se dibujan a medida, con el mismo trazo fino que el resto del
 * sitio (`stroke: currentColor`, sin relleno) para que no desentonen.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

function AgaveIcon({ size = 24, strokeWidth = 1, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {/* Una sola planta de agave: pencas que salen de la base. */}
      <path d="M12 21V9" />
      <path d="M12 15 7.5 6.5" />
      <path d="M12 15l4.5-8.5" />
      <path d="M12 18 5.5 12" />
      <path d="M12 18l6.5-6" />
      <path d="M5 21h14" />
    </svg>
  );
}

function ChiselIcon({ size = 24, strokeWidth = 1, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {/* Cincel: mango, virola y filo en bisel. */}
      <path d="M13.5 3.5h5v6h-5z" />
      <path d="M16 9.5V13" />
      <path d="M13.5 13h5l-1.2 5.5h-2.6z" />
      <path d="M15.4 18.5 15 21" />
      <path d="M9 7l4 3" />
    </svg>
  );
}

/** Mapa id del catálogo → icono. `cardSymbols` (en el modelo) es la fuente. */
export const symbolIcons: Record<
  string,
  ComponentType<IconProps>
> = {
  agave: AgaveIcon,
  chisel: ChiselIcon,
  bottle: Milk,
  fingerprint: Fingerprint,
  orbit: Orbit,
  layers: Layers,
  flask: FlaskConical,
  gem: Gem,
  /** Respaldo histórico: la planta que se usaba antes del agave. */
  plant: Sprout,
};

export function SymbolIcon({
  symbol,
  size = 82,
  strokeWidth = 0.9,
}: {
  symbol?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = symbol ? symbolIcons[symbol] : undefined;
  if (!Icon) return null;
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}
