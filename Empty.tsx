import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

// Empty component with better styling
export function Empty({ title = "暂无内容", description = "点击创建新内容" }: { title?: string, description?: string }) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center h-full p-8 text-center cursor-pointer",
        "transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
      )}
      onClick={() => toast('Coming soon')}
    >
      <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <ImageIcon size={28} className="text-indigo-500" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}