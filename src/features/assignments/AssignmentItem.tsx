import { memo, useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { formatDate, getDeadlineInfo } from "../../shared/utils/date";
import { Icon } from "../../shared/components/Icon";
import { Modal } from "../../shared/components/Modal";
import {
  removeAssignment,
  toggleAssignment,
  updateAssignment,
} from "./assignmentsSlice";
import { type Assignment, PRIORITY_LABEL } from "./types";
function AssignmentItemBase({
  assignment,
  onNotice,
}: {
  assignment: Assignment;
  onNotice: (message: string) => void;
}) {
  const dispatch = useAppDispatch();
  const deadline = getDeadlineInfo(assignment);
  const [modal, setModal] = useState<"delete" | "note" | null>(null);
  const [note, setNote] = useState(assignment.note ?? "");
  return (
    <tr className={`assignment-row row--${deadline.kind}`}>
      <td className="check-cell">
        <input
          type="checkbox"
          checked={assignment.completed}
          aria-label={`${assignment.completed ? "Bỏ đánh dấu" : "Đánh dấu"} hoàn thành ${assignment.title}`}
          onChange={() => {
            dispatch(toggleAssignment(assignment.id));
            onNotice(
              `${assignment.completed ? "Đã bỏ đánh dấu" : "Đã hoàn thành"}: ${assignment.title}`,
            );
          }}
        />
      </td>
      <td>
        <span className="subject-badge">{assignment.subject}</span>
      </td>
      <td className="assignment-description">
        <strong>
          {assignment.completed && <span className="completed-check">✓ </span>}
          {assignment.title}
        </strong>
        <small>{assignment.note || "Không có ghi chú thêm"}</small>
      </td>
      <td className="date-cell">
        <time dateTime={assignment.dueDate}>
          {formatDate(assignment.dueDate)}
          <small>
            {new Date(assignment.dueDate).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </small>
        </time>
      </td>
      <td>
        <span
          className={`priority priority--${assignment.priority.toLowerCase()}`}
        >
          <i />
          {PRIORITY_LABEL[assignment.priority]}
        </span>
      </td>
      <td>
        <span className={`deadline deadline--${deadline.kind}`}>
          <Icon
            name={
              deadline.kind === "done"
                ? "task_alt"
                : deadline.kind === "overdue"
                  ? "error"
                  : deadline.kind === "dueToday"
                    ? "alarm"
                    : "schedule"
            }
          />
          {deadline.label}
        </span>
      </td>
      <td>
        <div className="row-actions">
          <button
            className="icon-button"
            aria-label={`Sửa ghi chú ${assignment.title}`}
            title="Sửa ghi chú"
            onClick={() => {
              setNote(assignment.note ?? "");
              setModal("note");
            }}
          >
            <Icon name="edit_note" />
          </button>
          <button
            className="icon-button icon-button--danger"
            aria-label={`Xoá ${assignment.title}`}
            title="Xoá bài tập"
            onClick={() => setModal("delete")}
          >
            <Icon name="delete" />
          </button>
        </div>
        {modal === "delete" && (
          <Modal title="Xoá bài tập này?" onClose={() => setModal(null)}>
            <div className="modal__body">
              <div className="delete-icon">
                <Icon name="delete_forever" />
              </div>
              <p>
                Bạn có chắc chắn muốn xoá bài tập{" "}
                <strong>{assignment.title}</strong>? Hành động này không thể
                hoàn tác.
              </p>
              <div className="modal__actions">
                <button className="btn" onClick={() => setModal(null)}>
                  Hủy
                </button>
                <button
                  className="btn btn--danger"
                  onClick={() => {
                    dispatch(removeAssignment(assignment.id));
                    onNotice(`Đã xoá bài tập: ${assignment.title}`);
                  }}
                >
                  Xoá bài tập
                </button>
              </div>
            </div>
          </Modal>
        )}
        {modal === "note" && (
          <Modal title="Sửa ghi chú" onClose={() => setModal(null)}>
            <form
              className="modal__body"
              onSubmit={(event) => {
                event.preventDefault();
                dispatch(
                  updateAssignment({
                    id: assignment.id,
                    changes: { note: note.trim() },
                  }),
                );
                setModal(null);
                onNotice("Đã cập nhật ghi chú bài tập.");
              }}
            >
              <label className="field">
                Ghi chú nộp bài
                <textarea
                  autoFocus
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  maxLength={1000}
                />
              </label>
              <div className="modal__actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setModal(null)}
                >
                  Hủy
                </button>
                <button className="btn btn--primary">Lưu ghi chú</button>
              </div>
            </form>
          </Modal>
        )}
      </td>
    </tr>
  );
}
export const AssignmentItem = memo(AssignmentItemBase);
