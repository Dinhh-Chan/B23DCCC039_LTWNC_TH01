import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { isOverdue, matchesFilter, daysUntil } from '../../shared/utils/date';
import {
  type Assignment,
  type AssignmentCountByFilter,
  FilterKey,
  PRIORITY_WEIGHT,
} from './types';

export const selectAllAssignments = (state: RootState): Assignment[] => state.assignments.items;
export const selectFilter = (state: RootState): FilterKey => state.assignments.filter;
export const selectStatus = (state: RootState) => state.assignments.status;
export const selectError = (state: RootState) => state.assignments.error;

/**
 * Sắp xếp: chưa hoàn thành lên trước, rồi tới hạn gần nhất, rồi độ ưu tiên cao.
 * Dùng createSelector để chỉ tính lại khi `items` thực sự đổi.
 */
const sortAssignments = (items: Assignment[]): Assignment[] =>
  [...items].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const dayDiff = daysUntil(a.dueDate) - daysUntil(b.dueDate);
    if (dayDiff !== 0) return dayDiff;
    return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
  });

/** Yêu cầu 1 + 5 — danh sách đã lọc theo tab đang chọn. */
export const selectVisibleAssignments = createSelector(
  [selectAllAssignments, selectFilter],
  (items, filter) => sortAssignments(items.filter((item) => matchesFilter(item, filter))),
);

/** Số lượng hiển thị trên từng tab lọc. */
export const selectCountByFilter = createSelector(
  [selectAllAssignments],
  (items): AssignmentCountByFilter => ({
    [FilterKey.All]: items.length,
    [FilterKey.Pending]: items.filter((item) => !item.completed).length,
    [FilterKey.Overdue]: items.filter((item) => isOverdue(item)).length,
    [FilterKey.Completed]: items.filter((item) => item.completed).length,
  }),
);
