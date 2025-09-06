import { getOrderByOrderCode } from "@/app/lib/api/get.api";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderDetail } from "@/interface/IOrder";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ProductButtonDeleteProps {
  orderCode: string;
}

const columns = ["Tên sản phẩm", "Số lượng", "Giá"];

export function PopupViewDetailOrder({ orderCode }: ProductButtonDeleteProps) {
  const [open, setOpen] = useState(false);
  const [orderDetail, setOrderDetail] = useState<OrderDetail[]>([]);
  const hasFetched = useRef(false);
  const lastOrderCode = useRef(orderCode);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && (!hasFetched.current || lastOrderCode.current !== orderCode)) {
      const fetchOrderDetail = async () => {
        const response = await getOrderByOrderCode(orderCode);
        setOrderDetail(response.data);
        hasFetched.current = true;
        lastOrderCode.current = orderCode;
        setLoading(false);
      };
      fetchOrderDetail();
    }
  }, [open, orderCode]);

  console.log(orderDetail);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className=" px-3 py-3 bg-blue-500 hover:bg-blue-700 text-white rounded-xl">
          Xem
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md z-[10000] xl:max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="uppercase">
            Danh sách sản phẩm trong đơn hàng <span className="text-red-500 font-bold">{orderCode}</span>
          </DialogTitle>
          <DialogDescription className="text-[#000]">
            <>
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {columns.map((item, index) => (
                      <>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-bold text-gray-500 text-start text-theme-xs dark:text-gray-400 uppercase"
                          key={index}
                        >
                          {item}
                        </TableCell>
                      </>
                    ))}
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100">
                  {loading ? (
                    <TableRow>
                      <TableCell className="text-center py-4 text-gray-500">
                        Đang tải ...
                      </TableCell>
                    </TableRow>
                  ) : orderDetail.length === 0 ? (
                    <TableRow>
                      <TableCell
                        className="text-center py-4 text-gray-500"
                        colSpan={5}
                      >
                        Không có đơn hàng nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orderDetail.map((item, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell className="px-5 py-4 text-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 overflow-hidden rounded-full">
                                <Image
                                  width={40}
                                  height={40}
                                  src={item.productImage}
                                  alt={item.productName}
                                />
                              </div>
                              <div>
                                <span className="block font-medium">
                                  {item.productName}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start">
                            {item.unitPrice}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
