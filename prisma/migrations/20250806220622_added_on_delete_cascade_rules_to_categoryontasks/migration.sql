-- DropForeignKey
ALTER TABLE "public"."CategoriesOnTasks" DROP CONSTRAINT "CategoriesOnTasks_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CategoriesOnTasks" DROP CONSTRAINT "CategoriesOnTasks_taskId_fkey";

-- AddForeignKey
ALTER TABLE "public"."CategoriesOnTasks" ADD CONSTRAINT "CategoriesOnTasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CategoriesOnTasks" ADD CONSTRAINT "CategoriesOnTasks_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
