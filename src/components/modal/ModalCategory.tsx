import {
  deleteCategory
} from "@/app/lib/api/delete.api";
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

interface CategoryButtonDeleteProps {
  id: string | number;
  name: string;
}

export function CategoryButtonDelete({ id, name }: CategoryButtonDeleteProps) {
  const [open, setOpen] = useState(false);
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await deleteCategory(id);

      toast.success(`Xóa sản phẩm ${name} thành công`);
      setOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
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
          <DialogTitle className="uppercase">Xóa danh mục {name}</DialogTitle>
          <DialogDescription className="text-[#000]">
            Bạn có chắc muốn xóa danh mục{" "}
            <span className="text-red-500 uppercase font-bold">{name}</span>{" "}
            không nếu bạn xóa danh mục này thì các sản phẩm liên quan đến danh
            mục sẽ không thuộc về danh mục nào nữa
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
