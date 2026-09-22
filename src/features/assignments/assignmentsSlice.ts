import { createAsyncThunk, createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import {
  type Assignment,
  type AssignmentId,
  type CreateAssignmentInput,
  type RequestStatus,
  type UpdateAssignmentInput,
  FilterKey,
  asAssignmentId,
  isApiResponse,
  isAssignmentArray,
} from './types';

interface AssignmentsState {
  items: Assignment[];
  status: RequestStatus;
  error: string | null;
  filter: FilterKey;
}

const initialState: AssignmentsState = {
  items: [],
  status: 'idle',
  error: null,
  filter: FilterKey.All,
};

/**
 * Yêu cầu 7 — lấy danh sách mẫu ban đầu từ API giả lập.
 * Generic <Assignment[], void, { rejectValue: string }>: kiểu trả về, kiểu tham số
 * và kiểu lỗi đều tường minh nên `action.payload` ở extraReducers tự suy ra đúng.
 */
export const fetchAssignments = createAsyncThunk<
  Assignment[],
  void,
  { rejectValue: string }
>('assignments/fetchAll', async (_arg, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/assignments');
    if (!response.ok) {
      return rejectWithValue(`Máy chủ trả về lỗi ${response.status}`);
    }

    const json: unknown = await response.json();

    // Type guard của Buổi 1: JSON là `unknown`, phải validate rồi mới tin dùng.
    if (!isApiResponse(json, isAssignmentArray)) {
      return rejectWithValue('Dữ liệu API không đúng định dạng');
    }

    return json.data;
  } catch {
    return rejectWithValue('Không kết nối được tới máy chủ');
  }
});

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    /**
     * Yêu cầu 2 — thêm bài tập mới.
     * `prepare` sinh sẵn id/createdAt để reducer giữ được tính thuần tuý
     * (không gọi nanoid/Date.now bên trong reducer).
     */
    addAssignment: {
      reducer(state, action: PayloadAction<Assignment>) {
        state.items.unshift(action.payload);
      },
      prepare(input: CreateAssignmentInput) {
        return {
          payload: {
            ...input,
            id: asAssignmentId(nanoid()),
            completed: false,
            createdAt: new Date().toISOString(),
          } satisfies Assignment,
        };
      },
    },

    /** Yêu cầu 3 — đánh dấu hoàn thành / bỏ đánh dấu. */
    toggleAssignment(state, action: PayloadAction<AssignmentId>) {
      const found = state.items.find((item) => item.id === action.payload);
      // Immer cho phép viết như mutate nhưng RTK vẫn trả về state mới.
      if (found) found.completed = !found.completed;
    },

    /** Yêu cầu 4 — xoá bài tập. */
    removeAssignment(state, action: PayloadAction<AssignmentId>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    /** Utility type UpdateAssignmentInput: chỉ cập nhật field được gửi lên. */
    updateAssignment(
      state,
      action: PayloadAction<{ id: AssignmentId; changes: UpdateAssignmentInput }>,
    ) {
      const found = state.items.find((item) => item.id === action.payload.id);
      if (found) Object.assign(found, action.payload.changes);
    },

    /** Yêu cầu 5 — đổi bộ lọc đang chọn. */
    setFilter(state, action: PayloadAction<FilterKey>) {
      state.filter = action.payload;
    },
  },

  /** Ba trạng thái của thunk, khai báo đủ để UI hiển thị loading/lỗi. */
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error.message ?? 'Lỗi không xác định';
      });
  },
});

export const {
  addAssignment,
  toggleAssignment,
  removeAssignment,
  updateAssignment,
  setFilter,
} = assignmentsSlice.actions;

export default assignmentsSlice.reducer;
