import { configureStore } from '@reduxjs/toolkit';
import assignmentsReducer from '../features/assignments/assignmentsSlice';

/**
 * configureStore() đã tự gộp reducer, bật redux-thunk và Redux DevTools,
 * nên không cần cấu hình thêm gì để xem được lịch sử action.
 */
export const store = configureStore({
  reducer: {
    assignments: assignmentsReducer,
  },
});

/** Suy ra tự động từ store, không viết tay. */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
