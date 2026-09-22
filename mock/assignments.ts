/**
 * Dữ liệu mẫu cho API giả lập (yêu cầu 7).
 * Hạn nộp được tính lệch tương đối so với thời điểm gọi API để lúc nào cũng có
 * đủ các tình huống: quá hạn, hạn hôm nay, sắp tới hạn.
 */

const dayOffset = (days: number): string => {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export interface MockAssignment {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
  createdAt: string;
}

export const buildMockAssignments = (): MockAssignment[] => [
  {
    id: 'as_001',
    subject: 'Lập trình Web nâng cao',
    title: 'Bài thực hành 01 — Student Deadline Tracker',
    dueDate: dayOffset(0),
    priority: 'HIGH',
    completed: false,
    createdAt: dayOffset(-7),
  },
  {
    id: 'as_002',
    subject: 'Trí tuệ nhân tạo',
    title: 'Báo cáo thuật toán tìm kiếm A*',
    dueDate: dayOffset(-3),
    priority: 'HIGH',
    completed: false,
    createdAt: dayOffset(-14),
  },
  {
    id: 'as_003',
    subject: 'Cơ sở dữ liệu phân tán',
    title: 'Bài tập chương 3 — Phân mảnh dữ liệu',
    dueDate: dayOffset(2),
    priority: 'MEDIUM',
    completed: false,
    createdAt: dayOffset(-5),
  },
  {
    id: 'as_004',
    subject: 'An toàn bảo mật thông tin',
    title: 'Thực hành mã hoá RSA',
    dueDate: dayOffset(6),
    priority: 'LOW',
    completed: false,
    createdAt: dayOffset(-2),
  },
  {
    id: 'as_005',
    subject: 'Lập trình Web nâng cao',
    title: 'Bài tập về nhà Buổi 2 — Accordion & usePagination',
    dueDate: dayOffset(-10),
    priority: 'MEDIUM',
    completed: true,
    createdAt: dayOffset(-20),
  },
  {
    id: 'as_006',
    subject: 'Kiến trúc máy tính',
    title: 'Chuẩn bị seminar nhóm 4',
    dueDate: dayOffset(12),
    priority: 'LOW',
    completed: false,
    createdAt: dayOffset(-1),
  },
];
