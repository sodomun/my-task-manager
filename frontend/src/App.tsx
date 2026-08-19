import { Navigate, Route, Routes, useLocation, type Location } from 'react-router-dom'
import './App.css'
import { Modal } from './components/Modal'
import { AuthProvider } from './context/AuthContext'
import { ExampleDetailPage } from './pages/ExampleDetailPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { TodayTasksPlaceholder } from './pages/TodayTasksPlaceholder'
import { ProtectedRoute } from './routes/ProtectedRoute'

interface ModalRoutingState {
  backgroundLocation?: Location
}

function App() {
  const location = useLocation()
  // 一覧ページなどからモーダルとして開かれた場合、navigate()時にstateへ「元いた場所」を積んでおく。
  // 直接アクセス/リロード時はstateが無い(=backgroundLocationがundefined)ので通常ページ扱いになる。
  const backgroundLocation = (location.state as ModalRoutingState | null)?.backgroundLocation

  return (
    <AuthProvider>
      {/* 背景側: モーダル表示中は「元いた場所」、それ以外は現在地をそのまま描画する */}
      <Routes location={backgroundLocation ?? location}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TodayTasksPlaceholder />
            </ProtectedRoute>
          }
        />
        {/* 直接アクセス/リロード時はここにマッチし、Modalに包まれない単独ページとして表示される */}
        <Route
          path="/example/:id"
          element={
            <ProtectedRoute>
              <ExampleDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* モーダル層: backgroundLocationがある(=アプリ内リンクから開かれた)時だけ、実際のURLに応じて重ねて描画する */}
      {backgroundLocation && (
        <Routes>
          <Route
            path="/example/:id"
            element={
              <ProtectedRoute>
                <Modal>
                  <ExampleDetailPage />
                </Modal>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </AuthProvider>
  )
}

export default App
