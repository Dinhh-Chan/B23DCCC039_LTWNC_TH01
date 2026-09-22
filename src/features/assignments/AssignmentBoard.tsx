import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Tabs } from "../../shared/components/Tabs";
import { Icon } from "../../shared/components/Icon";
import { AssignmentList } from "./AssignmentList";
import { fetchAssignments, setFilter } from "./assignmentsSlice";
import {
  selectAllAssignments,
  selectCountByFilter,
  selectError,
  selectFilter,
  selectStatus,
  selectVisibleAssignments,
} from "./selectors";
import { FILTER_LABEL, FilterKey, PRIORITY_LABEL, Priority } from "./types";

export function AssignmentBoard({
  onCreate,
  onNotice,
}: {
  onCreate: () => void;
  onNotice: (message: string) => void;
}) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectAllAssignments);
  const assignments = useAppSelector(selectVisibleAssignments);
  const counts = useAppSelector(selectCountByFilter);
  const filter = useAppSelector(selectFilter);
  const status = useAppSelector(selectStatus);
  const error = useAppSelector(selectError);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("");
  const subjects = Array.from(
    new Set(items.map((item) => item.subject)),
  ).sort();
  const query = search.trim().toLocaleLowerCase("vi");
  const visible = assignments.filter(
    (item) =>
      (!subject || item.subject === subject) &&
      (!priority || item.priority === priority) &&
      `${item.title} ${item.subject} ${item.note ?? ""}`
        .toLocaleLowerCase("vi")
        .includes(query),
  );
  useEffect(() => {
    if (status === "idle") void dispatch(fetchAssignments());
  }, [status, dispatch]);
  return (
    <section className="board" id="assignments" aria-label="Danh sách bài tập">
      <Tabs<FilterKey>
        value={filter}
        onValueChange={(next) => dispatch(setFilter(next))}
      >
        <div className="toolbar">
          <Tabs.List>
            {Object.values(FilterKey).map((key) => (
              <Tabs.Tab key={key} value={key} badge={counts[key]}>
                {FILTER_LABEL[key]}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <div className="search-controls">
            <label className="search">
              <Icon name="search" />
              <input
                aria-label="Tìm bài tập"
                placeholder="Tìm tên bài tập, môn học..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <select
              aria-label="Lọc môn học"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            >
              <option value="">Tất cả môn học</option>
              {subjects.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select
              aria-label="Lọc ưu tiên"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="">Mức ưu tiên</option>
              {Object.values(Priority).map((value) => (
                <option key={value} value={value}>
                  {PRIORITY_LABEL[value]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {Object.values(FilterKey).map((key) => (
          <Tabs.Panel key={key} value={key}>
            <AssignmentList
              assignments={visible}
              status={status}
              error={error}
              onRetry={() => void dispatch(fetchAssignments())}
              onCreate={onCreate}
              onNotice={onNotice}
            />
            <div className="table-footer">
              <span>
                Hiển thị{" "}
                <strong>{status === "succeeded" ? visible.length : "—"}</strong>{" "}
                trong tổng số {status === "succeeded" ? counts.all : "—"} bài
                tập
              </span>
              <span>
                <Icon name="touch_app" />
                Chọn checkbox để đổi trạng thái hoàn thành
              </span>
            </div>
          </Tabs.Panel>
        ))}
      </Tabs>
    </section>
  );
}
