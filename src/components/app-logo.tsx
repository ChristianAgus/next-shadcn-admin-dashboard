import type { SVGProps } from "react";

/** Generic storefront mark. Replace the SVG if you need a custom brand logo. */
export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      width={32}
      height={32}
      fill="none"
      stroke="currentColor"
      strokeWidth={20}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M120 152h160l20 176H100z" fill="currentColor" stroke="none" />
      <path d="M154 156v-24a46 46 0 0 1 92 0v24" />
    </svg>
  );
}
