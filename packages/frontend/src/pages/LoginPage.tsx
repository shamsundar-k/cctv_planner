/*
 * FILE SUMMARY — src/pages/LoginPage.tsx
 *
 * Login page shown to unauthenticated users at /login. Accessible only via
 * the PublicOnlyRoute guard (authenticated users are redirected to /).
 */
import LoginBackgroundOrbs from '../features/login/component/LoginBackgroundOrbs'
import LoginCard from '../features/login/component/LoginCard'
import LoginForm from '../features/login/component/LoginForm'
import LoginLogo from '../features/login/component/LoginLogo'
import LoginPageFooter from '../features/login/component/LoginPageFooter'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas font-sans bg-gradient-to-br from-canvas via-card/60 to-canvas">

      <LoginBackgroundOrbs />

      <div className="relative w-full max-w-md m-4">
        <LoginCard>
          <LoginLogo />
          <LoginForm />
        </LoginCard>
        <LoginPageFooter />
      </div>
    </div>
  )
}
