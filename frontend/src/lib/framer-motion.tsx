import type { HTMLAttributes, ReactNode } from "react";
import React from "react";

type MotionProps = HTMLAttributes<HTMLDivElement> & { children?: ReactNode; [key: string]: unknown };
const passthrough = ({ children, ...props }: MotionProps) => <div {...(props as HTMLAttributes<HTMLDivElement>)}>{children}</div>;
export const motion: any = new Proxy({}, { get: () => passthrough });
export function AnimatePresence({ children }: { children?: ReactNode; [key: string]: unknown }) { return <>{children}</>; }
