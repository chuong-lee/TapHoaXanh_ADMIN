import { deleteNewsById } from "@/app/lib/api/delete.api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

interface ProductButtonDeleteProps {
  id: string | number;
  name: string;
}

export function NewsButtonDelete({ id, name }: ProductButtonDeleteProps) {
  const [open, setOpen] = useState(false);
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await deleteNewsById(id);
      toast.success(`Xóa bài viết ${name} thành công`);
      setOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500); // đợi 1.5s rồi F5
    } catch (error) {
      toast.error(`Lỗi khi xóa: ${error}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className=" px-3 py-3 bg-red-500 hover:bg-red-700 text-white rounded-xl">
          Xóa
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md z-[10000]">
        <DialogHeader>
          <DialogTitle className="uppercase">Xóa bài viết {name}</DialogTitle>
          <DialogDescription className="text-[#000]">
            Bạn có chắc muốn xóa bài viết{" "}
            <span className="text-red-500 uppercase font-bold">{name}</span>{" "}
            không
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
            onClick={handleDelete}
          >
            Đồng ý
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
