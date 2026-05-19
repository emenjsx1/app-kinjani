import { memo, type ReactNode } from "react";

interface Props {
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}

export const EditorSidebar = memo(function EditorSidebar({ left, right, children }: Props) {
  return (
    <div className="flex h-full">
      {left && <aside className="w-64 border-r bg-background overflow-y-auto">{left}</aside>}
      <main className="flex-1 overflow-auto bg-muted/20">{children}</main>
      {right && <aside className="w-72 border-l bg-background overflow-y-auto">{right}</aside>}
    </div>
  );
});
