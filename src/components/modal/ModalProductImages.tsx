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
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

interface ProductButtonDeleteProps {
  isOpen: boolean;
  onClose: (open: boolean) => void; // phải nhận boolean
  imageId: number;
  imageName: string;
  imageUrl: string;
}

export function ModalProductImages({
  isOpen,
  onClose,
  imageId,
  imageName,
  imageUrl,
}: ProductButtonDeleteProps) {
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
    } catch (error) {
      toast.error(`Lỗi khi xóa: ${error}`);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose(false);
          // reset focus về body
          requestAnimationFrame(() => {
            document.body.focus();
          });
        } else {
          onClose(true);
        }
      }}
    >
      <DialogContent className="sm:max-w-md z-[10000]">
        <DialogHeader>
          <DialogTitle className="uppercase">
            hình ảnh của sản phẩm{" "}
            <span className="text-red-500 uppercase font-bold">
              {imageName}
            </span>{" "}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center">
          <Image
            width={500}
            height={500}
            src={imageUrl}
            alt={imageName}
            className="rounded-2xl"
          />
        </div>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button className="bg-blue-500 hover:bg-blue-700">
            <Link href={`edit-image/${imageId}`}>Sửa</Link>
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-700"
            type="button"
            onClick={handleDelete}
          >
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
