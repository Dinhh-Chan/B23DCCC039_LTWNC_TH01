import type { ComponentType } from "react";
import type { RequestStatus } from "../../features/assignments/types";

/** Props tối thiểu mà component được bọc phải có để HOC đọc được trạng thái. */
export interface AsyncStateProps {
  status: RequestStatus;
  error: string | null;
  onRetry?: () => void;
}

interface BoundaryOptions {
  loadingText?: string;
  onRetry?: () => void;
}

/**
 * Buổi 2 — HOC (pattern thứ hai, làm thêm ngoài Compound Component).
 *
 * `P extends AsyncStateProps` là generic có constraint: HOC bọc được mọi component
 * miễn là component đó nhận `status` và `error`, đồng thời giữ nguyên toàn bộ
 * kiểu props gốc nên chỗ gọi vẫn được kiểm tra kiểu đầy đủ.
 *
 * Mục đích: tách phần xử lý loading/error lặp đi lặp lại ra khỏi component hiển thị.
 */
export function withAsyncBoundary<P extends AsyncStateProps>(
  Component: ComponentType<P>,
  options: BoundaryOptions = {},
) {
  const { loadingText = "Đang tải...", onRetry } = options;

  function WithAsyncBoundary(props: P) {
    if (props.status === "loading" || props.status === "idle") {
      return (
        <div className="state state--loading" role="status">
          <p>{loadingText}</p>
          {[1, 2, 3].map((key) => (
            <div key={key} className="skeleton" aria-hidden="true" />
          ))}
        </div>
      );
    }

    if (props.status === "failed") {
      return (
        <div className="state state--error" role="alert">
          <p>{props.error ?? "Đã có lỗi xảy ra"}</p>
          {(props.onRetry ?? onRetry) && (
            <button
              type="button"
              className="btn"
              onClick={props.onRetry ?? onRetry}
            >
              Thử lại
            </button>
          )}
        </div>
      );
    }

    return <Component {...props} />;
  }

  // Đặt tên rõ ràng để React DevTools không hiện "Anonymous".
  WithAsyncBoundary.displayName = `withAsyncBoundary(${Component.displayName ?? Component.name})`;
  return WithAsyncBoundary;
}
