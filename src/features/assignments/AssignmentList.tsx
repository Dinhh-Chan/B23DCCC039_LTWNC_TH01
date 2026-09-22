import {
  withAsyncBoundary,
  type AsyncStateProps,
} from "../../shared/hoc/withAsyncBoundary";
import { Icon } from "../../shared/components/Icon";
import { AssignmentItem } from "./AssignmentItem";
import type { Assignment } from "./types";
interface AssignmentListProps extends AsyncStateProps {
  assignments: Assignment[];
  onCreate: () => void;
  onNotice: (message: string) => void;
}
function AssignmentListBase({
  assignments,
  onCreate,
  onNotice,
}: AssignmentListProps) {
  return (
    <div className="table-container">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Hoàn thành</th>
              <th scope="col">Môn học</th>
              <th scope="col">Tên bài tập & Ghi chú</th>
              <th scope="col">Hạn nộp</th>
              <th scope="col">Ưu tiên</th>
              <th scope="col">Thời gian đến hạn</th>
              <th scope="col">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <AssignmentItem
                key={assignment.id}
                assignment={assignment}
                onNotice={onNotice}
              />
            ))}
          </tbody>
        </table>
      </div>
      {!assignments.length && (
        <div className="empty-state">
          <span className="empty-state__icon">
            <Icon name="task" />
          </span>
          <h3>Không tìm thấy bài tập nào</h3>
          <p>
            Không có bài tập phù hợp với bộ lọc hiện tại.
            <br />
            Thử thay đổi từ khóa hoặc thêm một bài tập mới.
          </p>
          <button className="btn btn--primary" onClick={onCreate}>
            <Icon name="add" />
            Tạo bài tập mới ngay
          </button>
        </div>
      )}
    </div>
  );
}
export const AssignmentList = withAsyncBoundary(AssignmentListBase, {
  loadingText: "Đang kết nối API và tải danh sách bài tập…",
});
