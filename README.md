# Student Deadline Tracker

**LTWNC — Bài thực hành 01 (N2)** · RIPT1411-20261-02
Sinh viên: B23DCCC038

Ứng dụng quản lý deadline bài tập cá nhân, tổng hợp kiến thức Buổi 1 (TypeScript nâng
cao), Buổi 2 (Design pattern React) và Buổi 3 (Redux Toolkit + TypeScript).

## Chạy dự án

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit, 0 lỗi
npm run build      # tsc && vite build
```

API giả lập chạy ngay trong dev server của Vite (`vite.config.ts`), nên
`fetch('/api/assignments')` là request HTTP thật, thấy được ở tab Network.
Thêm `?simulateError=1` vào URL API để server trả 500, dùng demo nhánh `rejected`.

## Cấu trúc thư mục (feature-based)

```
mock/assignments.ts              dữ liệu mẫu cho API giả lập
vite.config.ts                   middleware giả lập GET /api/assignments
src/
  app/
    store.ts                     configureStore, RootState, AppDispatch
    hooks.ts                     useAppSelector, useAppDispatch (typed hooks)
  features/assignments/
    types.ts                     enum, interface, utility types, type guard
    assignmentsSlice.ts          createSlice + createAsyncThunk
    selectors.ts                 createSelector: lọc, sắp xếp, đếm
    AssignmentBoard.tsx          ghép Tabs + danh sách + thunk
    AssignmentForm.tsx           form thêm bài tập
    AssignmentList.tsx           danh sách (được bọc bởi HOC)
    AssignmentItem.tsx           một dòng bài tập
  shared/
    components/Tabs/             Compound Component
    hoc/withAsyncBoundary.tsx    HOC xử lý loading/error
    hooks/useForm.ts             custom hook generic
    utils/date.ts                tính "Còn X ngày" / "Quá hạn Y ngày"
```

## Đối chiếu 7 yêu cầu chức năng

| # | Yêu cầu | Cài đặt |
|---|---|---|
| 1 | Hiển thị danh sách bài tập | `AssignmentList.tsx`, `AssignmentItem.tsx` — hiện đủ môn học, tên bài, hạn nộp, độ ưu tiên, trạng thái |
| 2 | Thêm bài tập qua form | `AssignmentForm.tsx` + `useForm<T>` + action `addAssignment` (có `prepare` sinh id) |
| 3 | Đánh dấu / bỏ đánh dấu hoàn thành | action `toggleAssignment` |
| 4 | Xoá bài tập | action `removeAssignment` |
| 5 | Lọc theo trạng thái | `<Tabs>` compound component + `setFilter` + `matchesFilter()` |
| 6 | "Còn X ngày" / "Quá hạn Y ngày" | `getDeadlineInfo()` trả về discriminated union `DeadlineInfo` |
| 7 | Lấy danh sách mẫu từ API giả lập | `fetchAssignments` (createAsyncThunk) gọi `/api/assignments` khi khởi động |

## Đối chiếu kiến thức 3 buổi

### Buổi 1 — TypeScript nâng cao

- **Enum**: `Priority`, `FilterKey`.
- **Generic**: `ApiResponse<TData>`, `isApiResponse<TData>()`, `useForm<TValues>`,
  `Tabs<TValue extends string>`, `withAsyncBoundary<P extends AsyncStateProps>`.
- **Utility Types**:
  - `Omit` → `CreateAssignmentInput` (form không nhập `id`/`completed`/`createdAt`)
  - `Partial` + `Pick` → `UpdateAssignmentInput`
  - `Pick` → `AssignmentSummary`
  - `Record` → `AssignmentCountByFilter`, `PRIORITY_LABEL`, `FILTER_LABEL`
  - Mapped type tự viết → `FormErrors<TValues>`
  - `Extract` → thu hẹp union trong `isOverdueInfo`
- **Type guard**: `isAssignment`, `isAssignmentArray`, `isApiResponse` — JSON trả về là
  `unknown`, validate ở runtime rồi mới đưa vào store.
- **Discriminated union + exhaustive check**: `DeadlineInfo` phân theo `kind`;
  `matchesFilter()` dùng `const exhaustive: never` nên thêm `FilterKey` mới mà quên xử
  lý sẽ báo lỗi biên dịch.
- **Branded type**: `AssignmentId` để không truyền nhầm string bất kỳ.
- Không dùng `any` ở bất kỳ đâu; chỗ dữ liệu chưa biết dùng `unknown`.

### Buổi 2 — Design pattern React

Đề yêu cầu custom hook nâng cao **+ 1 trong 2** pattern HOC/Compound Component.
Bài này làm cả hai:

- **Compound Component** — `src/shared/components/Tabs/`:
  `<Tabs>`, `<Tabs.List>`, `<Tabs.Tab>`, `<Tabs.Panel>` chia sẻ state ngầm qua Context;
  `useTabsContext()` ném lỗi rõ ràng nếu dùng ngoài `<Tabs>`. Hỗ trợ cả chế độ
  uncontrolled (`defaultValue`) lẫn controlled (`value` + `onValueChange`) — bài này
  dùng controlled để nguồn sự thật của bộ lọc nằm trong Redux store.
- **HOC** — `withAsyncBoundary<P extends AsyncStateProps>(Component)`:
  generic có constraint, giữ nguyên kiểu props gốc, tách phần loading/error lặp lại ra
  khỏi component hiển thị. `AssignmentList` là component thuần, không biết gì về store.
- **Custom hook nâng cao** — `useForm<TValues>`:
  single responsibility (chỉ lo state + validate), không phụ thuộc UI cụ thể, interface
  trả về rõ ràng. `setFieldValue<TKey extends keyof TValues>` khiến gõ sai tên field là
  lỗi compile và giá trị truyền vào phải đúng kiểu của field đó.

### Buổi 3 — Redux Toolkit + TypeScript

- **Cấu trúc feature-based**: `app/store.ts`, `app/hooks.ts`, `features/assignments/…`.
- **configureStore**: `RootState` và `AppDispatch` suy ra tự động từ store.
- **createSlice**: 5 reducer (`addAssignment`, `toggleAssignment`, `removeAssignment`,
  `updateAssignment`, `setFilter`), đều dùng `PayloadAction<T>`. `addAssignment` dùng
  `prepare` để sinh `id`/`createdAt` bên ngoài reducer, giữ reducer thuần tuý.
- **createAsyncThunk**: `fetchAssignments` khai báo
  `<Assignment[], void, { rejectValue: string }>`, xử lý đủ `pending`/`fulfilled`/`rejected`
  trong `extraReducers`.
- **Typed hooks**: mọi component chỉ dùng `useAppSelector`/`useAppDispatch`, không import
  `useSelector`/`useDispatch` gốc.
- **createSelector**: `selectVisibleAssignments`, `selectCountByFilter` chỉ tính lại khi
  dữ liệu nguồn đổi.
- **Redux DevTools** bật sẵn nhờ `configureStore`, xem được lịch sử action khi thêm/xoá/
  đánh dấu/đổi bộ lọc.

## Đã kiểm thử

- `npm run typecheck` → 0 lỗi; `npm run build` → build thành công.
- Chạy thật trên trình duyệt, không có lỗi console:
  - Khởi động app nạp 6 bài tập mẫu từ API, đếm đúng theo từng tab (6 / 5 / 1 / 1).
  - Submit form rỗng → hiện lỗi validate; thêm bài tập mới → danh sách lên 7, form tự
    reset, nhãn hạn nộp hiển thị "Còn 8 ngày".
  - Đánh dấu hoàn thành → badge các tab cập nhật đúng; xoá → danh sách giảm tương ứng.
  - API trả 500 → UI hiện "Máy chủ trả về lỗi 500" (nhánh `rejected` của thunk).

## Giao diện theo mẫu HTML

Giao diện React được dựng theo mẫu người dùng cung cấp: Plus Jakarta Sans, tông
xanh dương, thanh điều hướng, bốn thẻ thống kê, thanh lọc, bảng bài tập và modal.
CSS được quản lý trong `src/index.css`, không cần Tailwind CDN. Font và bộ icon
Material Symbols được tải từ Google Fonts.

- Bốn thẻ thống kê và badge lấy từ Redux selectors, không dùng số liệu cố định.
- Compound Tabs lọc trạng thái, hỗ trợ bàn phím và ARIA.
- Tìm theo tên bài, môn học hoặc ghi chú; kết hợp lọc môn và độ ưu tiên.
- Form trong modal dùng `useForm<T>`: môn, tên bài, ngày giờ, ưu tiên và ghi chú.
- Sửa ghi chú qua `updateAssignment`; xoá bài có bước xác nhận.
- Deadline tính theo thời gian hiện tại; hạn đã qua trong ngày cũng được xem là quá hạn.
- Nút tải lại thực sự gọi `createAsyncThunk`, có xác nhận trước khi thay dữ liệu.
- Có loading, error/retry, empty state, toast và lịch deadline dạng danh sách ngày.
- Bảng cuộn ngang trên điện thoại; dialog hỗ trợ Escape và giữ focus bên trong.

Đã đối chiếu với `baitap1` (generic, utility types, type guards), `baitap2`
(custom hook và Compound Component), `baitap3` (feature-based Redux Toolkit,
typed hooks, createAsyncThunk). Các yêu cầu kỹ thuật này vẫn được giữ.

### Kiểm tra phiên bản giao diện này

- `npm run build`: TypeScript và Vite build thành công.
- Chromium: nạp API, validate form, thêm bài có ngày giờ/ghi chú, đánh dấu và bỏ
  đánh dấu, cả bốn tab, tìm kiếm, lọc môn/ưu tiên, sửa ghi chú, huỷ/xác nhận xoá.
- Kiểm tra lịch deadline, Escape đóng modal, chuyển tab bằng bàn phím.
- Giả lập HTTP 500, thử lại thành công và tải lại danh sách qua API.
- Không có lỗi JavaScript trên trang; không tràn ngang toàn trang ở 375/768/1024 px.

### Phạm vi lưu trữ và nộp bài

Dữ liệu thao tác nằm trong Redux của phiên làm việc; tải lại trang sẽ lấy lại
bộ mẫu từ API. API giả lập hỗ trợ `npm run dev` và `npm run preview`; khi đưa thư mục
`dist` lên hosting tĩnh cần cung cấp endpoint API tương ứng.

Tên repository theo đề: **B23DCCC038_LTWNC_TH01** (có số 0 trước 1).
Nếu đặt private, mời tài khoản giảng viên **nvnhan**.
