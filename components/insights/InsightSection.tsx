import { Panel } from "@/components/shared/Panel";

type InsightSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function InsightSection({
  eyebrow,
  title,
  description,
  children,
}: InsightSectionProps) {
  return (
    <Panel eyebrow={eyebrow} title={title} description={description}>
      {children}
    </Panel>
  );
}
