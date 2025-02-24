import { Card, CardHeader } from "@/components/ui/card";
import { ItemHierarquico } from "@/types/navigation";
import { cn } from "@/lib/utils";

interface ListCardProps {
  item: ItemHierarquico;
  selected: boolean;
  onSelect: () => void;
}

export function ListCard({ item, selected, onSelect }: ListCardProps) {
  if (!item) {
    return null;
  }

  return (
    <div
      className={cn(
        "p-4 border rounded-lg cursor-pointer transition-colors",
        selected ? "bg-primary/5 border-primary" : "hover:bg-accent"
      )}
      onClick={onSelect}
    >
      <div className="space-y-2">
        <div className="font-medium">{item.nome}</div>
        <div className="text-sm text-muted-foreground">{item.descricao}</div>
      </div>
    </div>
  );
} 