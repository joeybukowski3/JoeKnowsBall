import { Badge } from "@/components/shared/Badge";

type LockedPickBadgeProps = {
  locked: boolean;
};

export function LockedPickBadge({ locked }: LockedPickBadgeProps) {
  return <Badge tone={locked ? "amber" : "neutral"}>{locked ? "Locked" : "Unlocked"}</Badge>;
}
