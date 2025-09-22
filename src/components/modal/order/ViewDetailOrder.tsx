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
import api from "@/app/lib/axios";
import {
  StatusOrder,
  StatusOrderDisplay,
} from "@/components/tables/OrderTable";

interface ProductButtonDeleteProps {
  orderCode: string;
  orderId?: number;
  currentStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  onStatusUpdate?: () => void;
}

const columns = ["Tên sản phẩm", "Số lượng", "Giá"];

export function PopupViewDetailOrder({
  orderCode,
  orderId,
  currentStatus,
  paymentMethod,
  paymentStatus,
  onStatusUpdate,
}: ProductButtonDeleteProps) {
  const [open, setOpen] = useState(false);
  const [orderDetail, setOrderDetail] = useState<OrderDetail[]>([]);
  const hasFetched = useRef(false);
  const lastOrderCode = useRef(orderCode);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  const getColorStatus = (status: string): StatusOrder => {
    switch (status) {
      case "success":
        return StatusOrder.SUCCESS;
      case "pending":
        return StatusOrder.PENDING;
      case "confirmed":
        return StatusOrder.CONFIRMED;
      case "delivered":
        return StatusOrder.DELIVERED;
      case "cancelled":
        return StatusOrder.CANCELLED;
      default:
        return StatusOrder.PENDING;
    }
  };

  const getStatusDisplay = (status: StatusOrder): string => {
    switch (status) {
      case StatusOrder.PENDING:
        return StatusOrderDisplay.PENDING;
      case StatusOrder.CONFIRMED:
        return StatusOrderDisplay.CONFIRMED;
      case StatusOrder.DELIVERED:
        return StatusOrderDisplay.DELIVERED;
      case StatusOrder.SUCCESS:
        return StatusOrderDisplay.SUCCESS;
      case StatusOrder.CANCELLED:
        return StatusOrderDisplay.CANCELLED;
      default:
        return StatusOrderDisplay.PENDING;
    }
  };

  const getNextStatus = (currentStatus: StatusOrder): StatusOrder | null => {
    switch (currentStatus) {
      case StatusOrder.PENDING:
        return StatusOrder.CONFIRMED;
      case StatusOrder.CONFIRMED:
        return StatusOrder.DELIVERED;
      case StatusOrder.DELIVERED:
        return StatusOrder.SUCCESS;
      default:
        return null;
    }
  };

  const getButtonText = (currentStatus: StatusOrder): string => {
    switch (currentStatus) {
      case StatusOrder.PENDING:
        return "Xác nhận";
      case StatusOrder.CONFIRMED:
        return "Bắt đầu giao hàng";
      case StatusOrder.DELIVERED:
        return "Đã giao hàng";
      default:
        return "";
    }
  };

  const getButtonColor = (currentStatus: StatusOrder): string => {
    switch (currentStatus) {
      case StatusOrder.PENDING:
        return "bg-blue-500 hover:bg-blue-600";
      case StatusOrder.CONFIRMED:
        return "bg-orange-500 hover:bg-orange-600";
      case StatusOrder.DELIVERED:
        return "bg-green-500 hover:bg-green-600";
      default:
        return "";
    }
  };

  const updateOrderStatus = async (newStatus: StatusOrder) => {
    if (!orderId) {
      console.error("OrderId không tồn tại");
      return;
    }

    setUpdatingStatus(true);
    try {
      const statusMap: Record<StatusOrder, string> = {
        [StatusOrder.CONFIRMED]: "confirmed",
        [StatusOrder.DELIVERED]: "delivered",
        [StatusOrder.SUCCESS]: "success",
        [StatusOrder.PENDING]: "pending",
        [StatusOrder.CANCELLED]: "cancelled",
      };

      const noteMap: Record<StatusOrder, string> = {
        [StatusOrder.CONFIRMED]: "Đơn hàng đã được xác nhận và chuẩn bị giao",
        [StatusOrder.DELIVERED]: "Đơn hàng đang được giao đến khách hàng",
        [StatusOrder.SUCCESS]: "Đơn hàng đã được giao thành công",
        [StatusOrder.PENDING]: "Đơn hàng đang chờ xử lý",
        [StatusOrder.CANCELLED]: "Đơn hàng đã bị hủy",
      };

      const requestData = {
        status: statusMap[newStatus],
        note: noteMap[newStatus],
      };

      console.log("Đang cập nhật trạng thái:", {
        orderId,
        newStatus,
        requestData,
        url: `/order/${orderId}/status`,
      });

      const response = await api.patch(`/order/${orderId}/status`, requestData);

      console.log("Cập nhật thành công:", response.data);

      // Call parent callback to refresh data
      if (onStatusUpdate) {
        onStatusUpdate();
      }

      // Close modal after successful update
      setOpen(false);
    } catch (error: unknown) {
      console.error("Lỗi khi cập nhật trạng thái:", error);

      let errorMessage = "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        console.error("Error response:", axiosError.response?.data);
        console.error("Error status:", axiosError.response?.status);

        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error && typeof error === "object" && "message" in error) {
        const messageError = error as { message: string };
        errorMessage = messageError.message;
      }

      alert(errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const currentStatusEnum = currentStatus
    ? getColorStatus(currentStatus)
    : StatusOrder.PENDING;
  const nextStatus = getNextStatus(currentStatusEnum);
  const buttonText = getButtonText(currentStatusEnum);
  const buttonColor = getButtonColor(currentStatusEnum);

  // Với COD: luôn cho phép cập nhật
  // Với VNPay: chỉ cho phép cập nhật khi payment status là "success"
  const canUpdateStatus =
    paymentMethod === "COD" || paymentStatus === "success";

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
            Danh sách sản phẩm trong đơn hàng{" "}
            <span className="text-red-500 font-bold">{orderCode}</span>
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

        <DialogFooter className="sm:justify-between">
          <div>
            {currentStatus && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Trạng thái hiện tại: </span>
                <span className="font-bold text-blue-600">
                  {getStatusDisplay(currentStatusEnum)}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {nextStatus && canUpdateStatus && (
              <Button
                onClick={() => updateOrderStatus(nextStatus)}
                disabled={updatingStatus}
                className={`text-white ${buttonColor} ${
                  updatingStatus ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {updatingStatus ? "Đang cập nhật..." : buttonText}
              </Button>
            )}
            {!canUpdateStatus && (
              <div className="text-sm text-gray-500 italic">
                {paymentMethod === "VNPAY" && paymentStatus === "pending"
                  ? "VNPay - Chờ thanh toán - Không thể cập nhật trạng thái"
                  : paymentMethod === "VNPAY" && paymentStatus === "fail"
                  ? "VNPay - Thanh toán thất bại - Không thể cập nhật trạng thái"
                  : "Không thể cập nhật trạng thái"}
              </div>
            )}
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Đóng
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
