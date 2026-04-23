-- CreateTable
CREATE TABLE "supplier_contracts" (
    "id" SERIAL NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "vegetable_id" INTEGER NOT NULL,
    "volume_kg" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "supplier_contracts_supplier_id_vegetable_id_key" ON "supplier_contracts"("supplier_id", "vegetable_id");

-- AddForeignKey
ALTER TABLE "supplier_contracts" ADD CONSTRAINT "supplier_contracts_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_contracts" ADD CONSTRAINT "supplier_contracts_vegetable_id_fkey" FOREIGN KEY ("vegetable_id") REFERENCES "vegetables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
