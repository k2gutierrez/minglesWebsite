// This file tells TypeScript to allow <tgs-player>
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'tgs-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        autoplay?: boolean;
        loop?: boolean;
        mode?: string;
        style?: React.CSSProperties;
      };
    }
  }
}
export {};