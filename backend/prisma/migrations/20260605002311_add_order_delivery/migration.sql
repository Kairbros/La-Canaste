-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryId" INTEGER;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
