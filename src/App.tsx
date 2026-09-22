import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { AssignmentBoard } from "./features/assignments/AssignmentBoard";
import { AssignmentForm } from "./features/assignments/AssignmentForm";
import {
  selectAllAssignments,
  selectCountByFilter,
  selectStatus,
} from "./features/assignments/selectors";
import {
  fetchAssignments,
  setFilter,
} from "./features/assignments/assignmentsSlice";
import { FilterKey } from "./features/assignments/types";
import { daysUntil, formatDate } from "./shared/utils/date";
import { Icon } from "./shared/components/Icon";
import { Modal } from "./shared/components/Modal";

export default function App() {
  const items = useAppSelector(selectAllAssignments);
  const counts = useAppSelector(selectCountByFilter);
  const status = useAppSelector(selectStatus);
  const dispatch = useAppDispatch();
  const [modal, setModal] = useState<
    "create" | "reload" | "calendar" | "help" | null
  >(null);
  const [notice, setNotice] = useState("");
  const [boardVersion, setBoardVersion] = useState(0);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(id);
  }, [notice]);
  const ready = status === "succeeded";
  const subjects = new Set(items.map((item) => item.subject)).size;
  const todayCount = items.filter(
    (item) => !item.completed && daysUntil(item.dueDate) === 0,
  ).length;
  const statistics = [
    {
      key: FilterKey.All,
      label: "Tổng số bài tập",
      icon: "assignment",
      unit: "bài tập",
      detail: `${subjects} môn học đang theo dõi`,
      detailIcon: "school",
    },
    {
      key: FilterKey.Pending,
      label: "Chưa hoàn thành",
      icon: "hourglass_top",
      unit: "bài cần làm",
      detail: `${todayCount} bài cần nộp hôm nay`,
      detailIcon: "schedule",
    },
    {
      key: FilterKey.Overdue,
      label: "Quá hạn nộp",
      icon: "warning",
      unit: "bài trễ hạn",
      detail: counts.overdue ? "Cần ưu tiên xử lý" : "Không có bài tập quá hạn",
      detailIcon: "error",
    },
    {
      key: FilterKey.Completed,
      label: "Đã hoàn thành",
      icon: "check_circle",
      unit: "bài xong",
      detail: `Tỷ lệ đạt ${counts.all ? Math.round((counts.completed / counts.all) * 100) : 0}%`,
      detailIcon: "verified",
    },
  ];
  return (
    <div className="app">
      <a className="skip-link" href="#assignments">
        Đến danh sách bài tập
      </a>
      <header className="topbar">
        <div className="topbar__inner">
          <a href="#assignments" className="brand">
            <span className="brand__mark">
              <Icon name="event_available" />
            </span>
            <span>
              <strong>Student Deadline Tracker</strong>
              <small>Theo dõi bài tập, chủ động thời gian</small>
            </span>
          </a>
          <nav aria-label="Điều hướng chính">
            <a className="nav-active" href="#assignments">
              Danh sách bài tập
            </a>
            <button onClick={() => setModal("calendar")}>Lịch deadline</button>
            <a href="#overview">Thống kê học tập</a>
          </nav>
          <span className="semester">Năm học 2026–2027</span>
          <button
            className="notification icon-button"
            aria-label={`${counts.overdue} bài quá hạn`}
            onClick={() => {
              dispatch(setFilter(FilterKey.Overdue));
              document.getElementById("assignments")?.scrollIntoView();
            }}
          >
            <Icon name="notifications" />
            {counts.overdue > 0 && <b>{counts.overdue}</b>}
          </button>
          <div className="student">
            <span className="avatar">
              <Icon name="person" />
            </span>
            <span>
              <strong>B23DCCC038</strong>
              <small>Sinh viên CNTT</small>
            </span>
          </div>
        </div>
      </header>
      <main className="container">
        <section className="intro">
          <div>
            <div className="intro__meta">
              <span>LTWNC · THỰC HÀNH 01</span>
              <small>• Không gian học tập cá nhân</small>
            </div>
            <h1>Student Deadline Tracker</h1>
            <p>
              Theo dõi bài tập, chủ động thời gian & nâng cao hiệu quả học tập.
            </p>
          </div>
          <div className="actions">
            <button
              className="btn"
              disabled={status === "loading" || status === "idle"}
              onClick={() => setModal("reload")}
            >
              <Icon name="sync" />
              Tải lại danh sách
            </button>
            <button
              className="btn btn--primary"
              disabled={!ready}
              onClick={() => setModal("create")}
            >
              <Icon name="add" />
              Thêm bài tập
            </button>
          </div>
        </section>
        <section
          id="overview"
          className="overview"
          aria-label="Thống kê học tập"
        >
          {statistics.map((stat) => (
            <button
              key={stat.key}
              className={`summary summary--${stat.key}`}
              onClick={() => dispatch(setFilter(stat.key))}
            >
              <span className="summary__top">
                {stat.label}
                <span className="summary__icon">
                  <Icon name={stat.icon} />
                </span>
              </span>
              <span className="summary__value">
                <strong>{ready ? counts[stat.key] : "—"}</strong>
                <small>{stat.unit}</small>
              </span>
              <span className="summary__detail">
                <Icon name={stat.detailIcon} />
                {ready ? stat.detail : "Đang tải dữ liệu…"}
              </span>
            </button>
          ))}
        </section>
        <AssignmentBoard
          key={boardVersion}
          onCreate={() => setModal("create")}
          onNotice={setNotice}
        />
      </main>
      <footer>
        <div className="container footer__inner">
          <div>
            <p>© 2026 Student Deadline Tracker. Hỗ trợ học tập hiệu quả.</p>
            <small>
              Mẹo: Hoàn thành bài tập trước 24 giờ để có thời gian kiểm tra lại
              bài nộp.
            </small>
          </div>
          <button className="text-button" onClick={() => setModal("help")}>
            Trung tâm trợ giúp
          </button>
          <span>LTWNC · B23DCCC038</span>
        </div>
      </footer>
      {notice && (
        <div className="toast" role="status">
          <Icon name="check_circle" />
          {notice}
        </div>
      )}
      {modal === "create" && (
        <Modal title="Thêm bài tập mới" onClose={() => setModal(null)}>
          <AssignmentForm
            onCancel={() => setModal(null)}
            onCreated={(title) => {
              setModal(null);
              setBoardVersion((value) => value + 1);
              setNotice(`Đã thêm bài tập: ${title}`);
            }}
          />
        </Modal>
      )}
      {modal === "reload" && (
        <Modal title="Tải lại dữ liệu mẫu?" onClose={() => setModal(null)}>
          <div className="modal__body">
            <p>
              Danh sách hiện tại sẽ được thay bằng dữ liệu mẫu từ API. Những bài
              đã thêm và thay đổi trong phiên này sẽ mất.
            </p>
            <div className="modal__actions">
              <button className="btn" onClick={() => setModal(null)}>
                Hủy
              </button>
              <button
                className="btn btn--primary"
                onClick={() => {
                  setModal(null);
                  void dispatch(fetchAssignments())
                    .unwrap()
                    .then(() => setNotice("Đã tải lại danh sách bài tập."))
                    .catch(() =>
                      setNotice("Tải lại thất bại. Vui lòng thử lại."),
                    );
                }}
              >
                Tải lại
              </button>
            </div>
          </div>
        </Modal>
      )}
      {modal === "calendar" && (
        <Modal title="Lịch deadline" onClose={() => setModal(null)}>
          <div className="modal__body calendar">
            {[...items]
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
              .map((item) => (
                <article key={item.id}>
                  <time>{formatDate(item.dueDate)}</time>
                  <div>
                    <strong>{item.title}</strong>
                    <small>
                      {item.subject} ·{" "}
                      {item.completed ? "Đã hoàn thành" : "Chưa hoàn thành"}
                    </small>
                  </div>
                </article>
              ))}
            {!items.length && <p>Chưa có bài tập để hiển thị.</p>}
          </div>
        </Modal>
      )}
      {modal === "help" && (
        <Modal title="Hướng dẫn sử dụng" onClose={() => setModal(null)}>
          <div className="modal__body">
            <p>
              Thêm bài tập với môn học, tên bài, ngày giờ nộp và độ ưu tiên.
              Dùng ô tìm kiếm và các bộ lọc để tìm bài cần làm.
            </p>
            <p>
              Chọn ô hoàn thành khi làm xong; chọn lại để bỏ đánh dấu. Nút bút
              chì giúp sửa ghi chú, nút thùng rác giúp xoá bài sau khi xác nhận.
            </p>
            <p>
              Dữ liệu được giữ trong phiên làm việc. Tải lại trang hoặc tải lại
              danh sách sẽ khôi phục bộ mẫu từ API giả lập.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
