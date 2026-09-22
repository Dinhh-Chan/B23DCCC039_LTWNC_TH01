import { useMemo } from "react";
import { useAppDispatch } from "../../app/hooks";
import { useForm } from "../../shared/hooks/useForm";
import { toDateInputValue } from "../../shared/utils/date";
import { Icon } from "../../shared/components/Icon";
import { addAssignment, setFilter } from "./assignmentsSlice";
import { FilterKey, type FormErrors, Priority, PRIORITY_LABEL } from "./types";
interface FormValues extends Record<string, unknown> {
  subject: string;
  title: string;
  dueDate: string;
  time: string;
  note: string;
  priority: Priority;
}
function validate(values: FormValues): FormErrors<FormValues> {
  const errors: FormErrors<FormValues> = {};
  if (!values.subject.trim()) errors.subject = "Vui lòng nhập môn học";
  if (!values.title.trim()) errors.title = "Vui lòng nhập tên bài tập";
  if (
    !values.dueDate ||
    Number.isNaN(Date.parse(`${values.dueDate}T${values.time}`))
  )
    errors.dueDate = "Vui lòng chọn ngày và giờ hợp lệ";
  if (!values.time) errors.time = "Vui lòng chọn giờ hết hạn";
  return errors;
}
export function AssignmentForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (title: string) => void;
}) {
  const dispatch = useAppDispatch();
  const initialValues = useMemo<FormValues>(
    () => ({
      subject: "",
      title: "",
      dueDate: toDateInputValue(new Date().toISOString()),
      time: "23:59",
      note: "",
      priority: Priority.Medium,
    }),
    [],
  );
  const { values, errors, handleChange, handleSubmit } = useForm<FormValues>({
    initialValues,
    validate,
    onSubmit: (values) => {
      dispatch(
        addAssignment({
          subject: values.subject.trim(),
          title: values.title.trim(),
          dueDate: new Date(`${values.dueDate}T${values.time}`).toISOString(),
          priority: values.priority,
          note: values.note.trim(),
        }),
      );
      dispatch(setFilter(FilterKey.All));
      onCreated(values.title.trim());
    },
  });
  return (
    <form className="form modal__body" onSubmit={handleSubmit} noValidate>
      <p className="form-description">
        Điền thông tin deadline và yêu cầu bài nộp
      </p>
      {(
        [
          {
            name: "subject",
            label: "Môn học",
            placeholder: "Ví dụ: Lập trình Web nâng cao",
          },
          {
            name: "title",
            label: "Tên bài tập & Mô tả ngắn",
            placeholder: "Ví dụ: Xây dựng RESTful API với Node.js",
          },
        ] as const
      ).map((field) => (
        <label className="field" key={field.name}>
          <span>
            {field.label} <em>*</em>
          </span>
          <input
            autoFocus={field.name === "subject"}
            name={field.name}
            value={values[field.name]}
            onChange={handleChange}
            placeholder={field.placeholder}
            maxLength={200}
            aria-invalid={Boolean(errors[field.name])}
            aria-describedby={
              errors[field.name] ? `error-${field.name}` : undefined
            }
          />
          {errors[field.name] && (
            <small className="field__error" id={`error-${field.name}`}>
              {errors[field.name]}
            </small>
          )}
        </label>
      ))}
      <div className="form-columns">
        {(
          [
            { name: "dueDate", label: "Ngày hết hạn", type: "date" },
            { name: "time", label: "Giờ hết hạn", type: "time" },
          ] as const
        ).map((field) => (
          <label className="field" key={field.name}>
            <span>
              {field.label} <em>*</em>
            </span>
            <input
              type={field.type}
              name={field.name}
              value={values[field.name]}
              onChange={handleChange}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={
                errors[field.name] ? `error-${field.name}` : undefined
              }
            />
            {errors[field.name] && (
              <small className="field__error" id={`error-${field.name}`}>
                {errors[field.name]}
              </small>
            )}
          </label>
        ))}
      </div>
      <fieldset className="priority-options">
        <legend>Mức độ ưu tiên</legend>
        {Object.values(Priority).map((priority) => (
          <label key={priority}>
            <input
              type="radio"
              name="priority"
              value={priority}
              checked={values.priority === priority}
              onChange={handleChange}
            />
            <span className={`priority priority--${priority.toLowerCase()}`}>
              <i />
              {PRIORITY_LABEL[priority]}
            </span>
          </label>
        ))}
      </fieldset>
      <label className="field">
        Ghi chú nộp bài{" "}
        <textarea
          rows={3}
          name="note"
          value={values.note}
          onChange={handleChange}
          placeholder="Yêu cầu bài nộp, đường dẫn tài liệu..."
          maxLength={1000}
        />
      </label>
      <div className="modal__actions">
        <button type="button" className="btn" onClick={onCancel}>
          Hủy
        </button>
        <button type="submit" className="btn btn--primary">
          <Icon name="add" />
          Thêm bài tập
        </button>
      </div>
    </form>
  );
}
