import { createContext, useContext } from "react";

/**
 * Buổi 2 — Compound Component.
 * Context để Tabs.Tab / Tabs.Panel "ngầm" chia sẻ tab đang chọn với Tabs cha,
 * không phải truyền props thủ công qua nhiều tầng.
 *
 * Generic <TValue extends string> giữ được kiểu literal của value (ở đây là
 * FilterKey) thay vì tụt xuống `string`.
 */
export interface TabsContextValue<TValue extends string = string> {
  id: string;
  value: TValue;
  setValue: (next: TValue) => void;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

/**
 * Gọi ngoài <Tabs> sẽ báo lỗi rõ ràng thay vì lặng lẽ nhận null.
 * Trả về bản `string` vì Tabs.Tab/Tabs.Panel chỉ cần so sánh bằng; phần ràng buộc
 * kiểu literal nằm ở props của <Tabs> nên chỗ gọi vẫn được kiểm tra đầy đủ.
 */
export function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs.* chỉ được dùng bên trong <Tabs>");
  }
  return context;
}
