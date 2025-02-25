import { Card } from "@/components/ui/card";
import { ItemHierarquico } from "@/types/navigation";
import { cn } from "@/lib/utils";

interface ListCardProps {
  item: ItemHierarquico;
  selected: boolean;
  onSelect: () => void;
}

export function ListCard({ item, selected, onSelect }: ListCardProps) {
  return (
    <div
      className={cn(
        "p-4 border rounded-lg cursor-pointer transition-colors",
        selected ? "bg-primary/5 border-primary" : "hover:bg-accent"
      )}
      onClick={onSelect}
    >
      <div className="space-y-2">
        <div className="font-medium text-slate-100">{item.nome}</div>
        {item.descricao && (
          <div className="text-sm text-slate-400">{item.descricao}</div>
        )}
      </div>
    </div>
  );
} 