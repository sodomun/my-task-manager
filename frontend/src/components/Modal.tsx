import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * URL連動モーダルの見た目部分。
 * 閉じる操作は navigate(-1) で「モーダルを開く前の背景ページ」の履歴に戻る。
 */
export function Modal({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  const close = () => navigate(-1)

  return (
    <div className="modal-overlay" onClick={close} role="presentation">
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button type="button" className="modal-close" onClick={close} aria-label="閉じる">
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
