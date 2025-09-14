import {
  deletedRatingByProductId,
  deleteProductById,
  deleteProductImagesByProductId,
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
import { handleAxiosErrorInTable } from "@/interface/IError";
import { useState } from "react";
import { toast } from "sonner";

interface ProductButtonDeleteProps {
  productId: string | number;
  productName: string;
}

export function ProductButtonDelete({
  productId,
  productName,
}: ProductButtonDeleteProps) {
  const [open, setOpen] = useState(false);
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await deletedRatingByProductId(productId);
      await deleteProductImagesByProductId(productId);
      await deleteProductById(productId);
      toast.success(`Xóa sản phẩm ${productName} thành công`);
      setOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500); // đợi 1.5s rồi F5
    } catch (error) {
      const msg = handleAxiosErrorInTable(error);
      toast.error(`Lỗi khi xóa: ${msg}`);
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
          <DialogTitle className="uppercase">
            Xóa sản phẩm {productName}
          </DialogTitle>
          <DialogDescription className="text-[#000]">
            Nếu bạn muốn xóa sản phẩm{" "}
            <span className="text-red-500 uppercase font-bold">
              {productName}
            </span>{" "}
            thì bạn phải <span className="font-bold">Xóa hình ảnh</span> liên
            quan đến sản phẩm này
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
