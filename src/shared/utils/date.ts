import {
  type Assignment,
  type DeadlineInfo,
  FilterKey,
} from "../../features/assignments/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Bỏ phần giờ/phút để đếm ngày theo lịch, tránh lệch do chênh vài tiếng. */
const startOfDay = (value: Date): number => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Số ngày lệch giữa hạn nộp và hôm nay (âm = đã quá hạn). */
export const daysUntil = (dueDate: string, now: Date = new Date()): number =>
  Math.round((startOfDay(new Date(dueDate)) - startOfDay(now)) / MS_PER_DAY);

/**
 * Yêu cầu 6: sinh nhãn "Còn X ngày" / "Quá hạn Y ngày".
 * Trả về discriminated union để component tự quyết định màu sắc theo `kind`.
 */
export function getDeadlineInfo(
  assignment: Assignment,
  now: Date = new Date(),
): DeadlineInfo {
  if (assignment.completed) {
    return { kind: "done", label: "Đã hoàn thành" };
  }

  const days = daysUntil(assignment.dueDate, now);

  if (new Date(assignment.dueDate).getTime() < now.getTime()) {
    const overdueDays = Math.max(
      1,
      Math.ceil(
        (now.getTime() - new Date(assignment.dueDate).getTime()) / MS_PER_DAY,
      ),
    );
    return {
      kind: "overdue",
      days: overdueDays,
      label: days === 0 ? "Quá hạn dưới 1 ngày" : `Quá hạn ${-days} ngày`,
    };
  }

  if (days > 0) return { kind: "upcoming", days, label: `Còn ${days} ngày` };
  if (days === 0) return { kind: "dueToday", label: "Hạn hôm nay" };
  return { kind: "overdue", days: -days, label: `Quá hạn ${-days} ngày` };
}

/** Quá hạn = chưa hoàn thành và hạn nộp đã trôi qua. */
export const isOverdue = (
  assignment: Assignment,
  now: Date = new Date(),
): boolean =>
  !assignment.completed &&
  new Date(assignment.dueDate).getTime() < now.getTime();

/** Điều kiện lọc của yêu cầu 5, tách riêng để slice và selector dùng chung. */
export function matchesFilter(
  assignment: Assignment,
  filter: FilterKey,
  now: Date = new Date(),
): boolean {
  switch (filter) {
    case FilterKey.All:
      return true;
    case FilterKey.Pending:
      return !assignment.completed;
    case FilterKey.Overdue:
      return isOverdue(assignment, now);
    case FilterKey.Completed:
      return assignment.completed;
    default: {
      // Thêm FilterKey mới mà quên xử lý -> `never` sai kiểu -> lỗi compile.
      const exhaustive: never = filter;
      return exhaustive;
    }
  }
}

/** Hiển thị hạn nộp dạng dd/mm/yyyy. */
export const formatDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/** Chuyển ISO string sang value cho <input type="date">. */
export const toDateInputValue = (isoDate: string): string => {
  const date = new Date(isoDate);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
