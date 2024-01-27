import prismadb from "@/lib/prismadb";

export const getTotalRevenue = async (storeId: string) => {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isBooked: true
    },
    include: {
      orderItems: {
        include: {
          productvalue: {
            select: { 
              id: true,  // Include other necessary fields    
              price: true
            }
          }
        }
      }
    }
  });

  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.totalPrice
    return total + orderTotal;
  }, 0);

  return totalRevenue;
};