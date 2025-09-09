"use client";

import { FoodDetailPage } from "@/components/menu/menuDetail";
import { useParams } from "next/navigation";

export default function MenuDetailPage() {
  const params = useParams();
  const menuId = params.slug as string;
  return <FoodDetailPage menuId={menuId} />;
}
