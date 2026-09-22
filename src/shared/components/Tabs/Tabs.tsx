import { useCallback, useId, useMemo, useState, type ReactNode } from "react";
import {
  TabsContext,
  useTabsContext,
  type TabsContextValue,
} from "./TabsContext";

interface TabsProps<TValue extends string> {
  /** Dùng khi để Tabs tự quản lý state (uncontrolled). */
  defaultValue?: TValue;
  /** Dùng khi state nằm ở nơi khác, ở đây là Redux store (controlled). */
  value?: TValue;
  onValueChange?: (next: TValue) => void;
  children: ReactNode;
}

/**
 * Hỗ trợ cả 2 chế độ:
 *  - uncontrolled: <Tabs defaultValue="all"> — Tabs tự giữ state
 *  - controlled:   <Tabs value={filter} onValueChange={...}> — nguồn sự thật là Redux
 * Bài này dùng chế độ controlled để bộ lọc nằm trong store, xem được trên DevTools.
 */
export function Tabs<TValue extends string>({
  defaultValue,
  value,
  onValueChange,
  children,
}: TabsProps<TValue>) {
  const id = useId();
  const [internal, setInternal] = useState<TValue | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const current = (isControlled ? value : internal) as TValue;

  const setValue = useCallback(
    (next: TValue) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      id,
      value: current,
      setValue: setValue as (next: string) => void,
    }),
    [id, current, setValue],
  );

  return (
    <TabsContext.Provider value={contextValue}>{children}</TabsContext.Provider>
  );
}

function TabsList({ children }: { children: ReactNode }) {
  return (
    <div
      className="tabs__list"
      role="tablist"
      aria-label="Lọc trạng thái bài tập"
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
          return;
        const tabs = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>(
            '[role="tab"]',
          ),
        );
        const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
                tabs.length;
        event.preventDefault();
        tabs[next]?.focus();
        tabs[next]?.click();
      }}
    >
      {children}
    </div>
  );
}

interface TabProps {
  value: string;
  badge?: number;
  children: ReactNode;
}

function Tab({ value, badge, children }: TabProps) {
  const { id, value: active, setValue } = useTabsContext();
  const selected = active === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${id}-tab-${value}`}
      aria-controls={`${id}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      aria-selected={selected}
      className={`tabs__tab${selected ? " tabs__tab--active" : ""}`}
      onClick={() => setValue(value)}
    >
      {children}
      {badge !== undefined && <span className="tabs__badge">{badge}</span>}
    </button>
  );
}

function TabsPanel({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const { id, value: active } = useTabsContext();
  if (active !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${id}-panel-${value}`}
      aria-labelledby={`${id}-tab-${value}`}
      tabIndex={0}
    >
      {children}
    </div>
  );
}

/** Gắn component con vào component cha để có API <Tabs.List>, <Tabs.Tab>... */
Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panel = TabsPanel;
