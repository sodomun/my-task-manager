import { useParams } from 'react-router-dom'

/**
 * モーダルルーティングの動作確認用サンプルページ。
 *
 * Phase2でタスク詳細モーダルを実装する際は、このファイルを参考にしつつ
 * 実データ（useParamsのidでタスクを取得するhook等）に差し替えて置き換える想定。
 *
 * このコンポーネント自体は「モーダルとして表示されているか単独ページか」を意識しない。
 * どちらで見せるかはApp.tsx側のルーティング（Modalで包むかどうか）だけで制御する。
 */
export function ExampleDetailPage() {
  const { id } = useParams()

  return (
    <div>
      <h2>サンプル詳細ページ（id: {id}）</h2>
      <p>
        一覧ページのリンクから開くとモーダル表示、このURLを直接開く／リロードすると
        通常の単独ページとして表示されます。
      </p>
    </div>
  )
}
