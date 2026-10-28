'use client';

import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  destructive = false,
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const modalId = useId().replace(/:/g, '');

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, loading, onCancel]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[3px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${modalId}-title`}
        aria-describedby={`${modalId}-description`}
        className="modal-panel max-h-[min(90dvh,560px)] w-full max-w-md overflow-y-auto rounded-2xl border border-white/80 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:rounded-3xl sm:p-7"
      >
        <h2 id={`${modalId}-title`} className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <p id={`${modalId}-description`} className="mt-2 text-sm leading-6 text-slate-600">
          {description}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            autoFocus
            disabled={loading}
            onClick={onCancel}
            className="min-h-11 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className={`min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${destructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}
