import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WriteContentWithAIProps {
  name: string;
  open: boolean; // <-- bật/tắt modal
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void; // <-- nhận hàm submit từ ngoài
}

export function WriteContentWithAI({
  name,
  open,
  onOpenChange,
  onSubmit,
}: WriteContentWithAIProps) {
  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onSubmit(name);
      onOpenChange(false);
    } // gọi hàm submit từ ngoài
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md z-[10000]">
        <DialogHeader>
          <DialogTitle className="uppercase">Viết bài bằng AI</DialogTitle>
          <DialogDescription className="text-[#000]">
            Bạn có chắc để AI viết bài về chủ đề{" "}
            <span className="text-red-500 uppercase font-bold">{name}</span>{" "}
            đúng không ?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button
            className="bg-blue-500 hover:bg-blue-700"
            type="button"
            onClick={handleConfirm}
          >
            Đồng ý
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
