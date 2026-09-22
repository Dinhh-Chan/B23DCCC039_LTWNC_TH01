/**
 * Buổi 1 — TypeScript nâng cao: enum, generic, utility types, type guard.
 * Toàn bộ kiểu dữ liệu của feature "assignments" gom về một chỗ (feature-based).
 */

/** Branded ID: chặn truyền nhầm một string bất kỳ vào chỗ cần AssignmentId. */
export type AssignmentId = string & { readonly __brand: "Assignment" };

export const asAssignmentId = (raw: string): AssignmentId =>
  raw as AssignmentId;

/** Độ ưu tiên — tập giá trị đóng nên dùng enum thay cho magic string. */
export enum Priority {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
}

/** Bộ lọc ở yêu cầu 5. */
export enum FilterKey {
  All = "all",
  Pending = "pending",
  Overdue = "overdue",
  Completed = "completed",
}

/** Trạng thái request của createAsyncThunk (Buổi 3). */
export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

/** Một bài tập cần theo dõi deadline. */
export interface Assignment {
  readonly id: AssignmentId;
  /** Môn học, ví dụ "Lập trình Web nâng cao". */
  subject: string;
  title: string;
  note?: string;
  /** Hạn nộp dạng ISO string để serialize được trong Redux store. */
  dueDate: string;
  priority: Priority;
  completed: boolean;
  readonly createdAt: string;
}

/* ── Utility Types ───────────────────────────────────────────────────────*/

/** Omit: form chỉ nhập 4 field, `id`/`completed`/`createdAt` do slice sinh ra. */
export type CreateAssignmentInput = Omit<
  Assignment,
  "id" | "completed" | "createdAt"
>;

/** Partial + Pick: sửa bài tập thì chỉ gửi field cần đổi, không đụng tới `id`. */
export type UpdateAssignmentInput = Partial<
  Pick<Assignment, "subject" | "title" | "dueDate" | "priority" | "note">
>;

/** Pick: dữ liệu tối giản cho phần thống kê/nhắc nhở. */
export type AssignmentSummary = Pick<
  Assignment,
  "id" | "title" | "subject" | "dueDate"
>;

/** Record: đếm số bài theo từng tab lọc — thiếu một FilterKey là lỗi compile. */
export type AssignmentCountByFilter = Record<FilterKey, number>;

/** Mapped type tự viết: gom lỗi validate theo đúng từng field của form. */
export type FormErrors<TValues> = Partial<Record<keyof TValues, string>>;

/* ── Generic ─────────────────────────────────────────────────────────────*/

/** Vỏ response chuẩn của API giả lập, dùng lại được cho mọi loại dữ liệu. */
export interface ApiResponse<TData> {
  success: boolean;
  data: TData;
  message?: string;
}

/* ── Discriminated union + type guard (yêu cầu 6) ────────────────────────*/

/**
 * Thông tin hiển thị hạn nộp. Tách thành union theo `kind` để mỗi nhánh mang
 * đúng dữ liệu của nó: nhánh `dueToday`/`done` không có `days` vì không cần.
 */
export type DeadlineInfo =
  | { kind: "upcoming"; days: number; label: string }
  | { kind: "dueToday"; label: string }
  | { kind: "overdue"; days: number; label: string }
  | { kind: "done"; label: string };

export const isOverdueInfo = (
  info: DeadlineInfo,
): info is Extract<DeadlineInfo, { kind: "overdue" }> =>
  info.kind === "overdue";

/** Thu hẹp `unknown` về object mà không phải ép kiểu `any`. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const PRIORITIES: readonly string[] = Object.values(Priority);

/**
 * Type guard cho dữ liệu lấy từ API: JSON trả về chưa chắc đúng shape,
 * validate ở runtime rồi mới đưa vào store.
 */
export function isAssignment(value: unknown): value is Assignment {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.subject === "string" &&
    typeof value.title === "string" &&
    (value.note === undefined || typeof value.note === "string") &&
    typeof value.dueDate === "string" &&
    !Number.isNaN(Date.parse(value.dueDate)) &&
    typeof value.priority === "string" &&
    PRIORITIES.includes(value.priority) &&
    typeof value.completed === "boolean" &&
    typeof value.createdAt === "string"
  );
}

/** Generic guard: kiểm vỏ `ApiResponse<T>` một lần, phần `data` uỷ quyền guard con. */
export function isApiResponse<TData>(
  value: unknown,
  isData: (data: unknown) => data is TData,
): value is ApiResponse<TData> {
  return (
    isRecord(value) &&
    typeof value.success === "boolean" &&
    "data" in value &&
    isData(value.data)
  );
}

export const isAssignmentArray = (value: unknown): value is Assignment[] =>
  Array.isArray(value) && value.every(isAssignment);

/* ── Nhãn hiển thị ───────────────────────────────────────────────────────*/

export const PRIORITY_LABEL: Record<Priority, string> = {
  [Priority.High]: "Cao",
  [Priority.Medium]: "Trung bình",
  [Priority.Low]: "Thấp",
};

export const FILTER_LABEL: Record<FilterKey, string> = {
  [FilterKey.All]: "Tất cả",
  [FilterKey.Pending]: "Chưa hoàn thành",
  [FilterKey.Overdue]: "Quá hạn",
  [FilterKey.Completed]: "Đã hoàn thành",
};

/** Thứ tự sắp xếp: ưu tiên cao lên trước khi cùng hạn nộp. */
export const PRIORITY_WEIGHT: Record<Priority, number> = {
  [Priority.High]: 0,
  [Priority.Medium]: 1,
  [Priority.Low]: 2,
};
