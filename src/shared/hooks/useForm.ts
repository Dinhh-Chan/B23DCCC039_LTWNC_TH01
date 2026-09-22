import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";
import type { FormErrors } from "../../features/assignments/types";

interface UseFormOptions<TValues> {
  initialValues: TValues;
  /** Trả về object lỗi theo từng field; rỗng nghĩa là hợp lệ. */
  validate?: (values: TValues) => FormErrors<TValues>;
  onSubmit: (values: TValues) => void;
}

interface UseFormResult<TValues> {
  values: TValues;
  errors: FormErrors<TValues>;
  setFieldValue: <TKey extends keyof TValues>(
    field: TKey,
    value: TValues[TKey],
  ) => void;
  handleChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  reset: () => void;
}

/**
 * Buổi 2 — custom hook nâng cao, generic theo kiểu form.
 *
 * Nguyên tắc thiết kế đã áp dụng:
 *  - Single responsibility: chỉ lo state + validate của form, không biết UI nào dùng nó.
 *  - Interface trả về rõ ràng, có type đầy đủ, không dùng `any`.
 *  - `TKey extends keyof TValues` khiến `setFieldValue('titl', ...)` là lỗi compile,
 *    và giá trị truyền vào phải đúng kiểu của đúng field đó.
 */
export function useForm<TValues extends Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<TValues>): UseFormResult<TValues> {
  const [values, setValues] = useState<TValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<TValues>>({});

  const setFieldValue = useCallback(
    <TKey extends keyof TValues>(field: TKey, value: TValues[TKey]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleChange = useCallback(
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = event.target;
      setFieldValue(name as keyof TValues, value as TValues[keyof TValues]);
    },
    [setFieldValue],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextErrors = validate?.(values) ?? {};

      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }

      onSubmit(values);
      reset();
    },
    [validate, values, onSubmit, reset],
  );

  return { values, errors, setFieldValue, handleChange, handleSubmit, reset };
}
