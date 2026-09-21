import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql'

type View = 'login' | 'signup'
type AuthResult = { data?: { signIn?: { token: string }; signUp?: { id: string } }; errors?: Array<{ message: string }> }

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v11H4z" /><path d="m4 7 8 6 8-6" /></svg>
}
function LockIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
}
function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
}
function EyeIcon({ hidden }: { hidden: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12s3.2-5 8.5-5 8.5 5 8.5 5-3.2 5-8.5 5-8.5-5-8.5-5Z" />{hidden ? <path d="m4 4 16 16" /> : <circle cx="12" cy="12" r="2" />}</svg>
}
function UserPlusIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M18 8v6M15 11h6" /></svg>
}
function LoginIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v14h-5M11 12h8M14 9l3 3-3 3" /><path d="M5 12h8" /></svg>
}
function Logo() {
  return <div className="brand" aria-label="Financy"><span className="brand-mark" aria-hidden="true"><span /></span><span className="brand-name">FINANCY</span></div>
}

async function requestGraphQL(query: string, variables: Record<string, string>) {
  const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables }) })
  const result = (await response.json()) as AuthResult
  if (!response.ok || result.errors?.length) throw new Error(result.errors?.[0]?.message ?? 'Não foi possível conectar à API.')
  return result
}

function App() {
  const [view, setView] = useState<View>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')

  function changeView(nextView: View) {
    setView(nextView)
    setErrorMessage('')
    setNotice('')
    setPassword('')
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setNotice('')
    if (!email.trim() || !password) {
      setErrorMessage('Informe seu e-mail e sua senha para continuar.')
      return
    }
    setIsLoading(true)
    try {
      const result = await requestGraphQL(`mutation SignIn($email: String!, $password: String!) {
        signIn(email: $email, password: $password) { token user { id email } }
      }`, { email: email.trim(), password })
      const token = result.data?.signIn?.token
      if (!token) throw new Error('Não foi possível entrar agora.')
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('financy_token', token)
      setNotice('Login realizado. Sua sessão está ativa.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível conectar à API.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setNotice('')
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Preencha todos os campos para criar sua conta.')
      return
    }
    if (password.length < 8) {
      setErrorMessage('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    setIsLoading(true)
    try {
      await requestGraphQL(`mutation SignUp($fullName: String!, $email: String!, $password: String!) {
        signUp(fullName: $fullName, email: $email, password: $password) { id }
      }`, { fullName: fullName.trim(), email: email.trim(), password })
      setPassword('')
      setView('login')
      setNotice('Conta criada com sucesso. Entre para continuar.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível criar sua conta.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <header className="page-header"><Logo /></header>
      {view === 'login' ? (
        <section className="login-card" aria-labelledby="login-title">
          <div className="login-heading"><h1 id="login-title">Fazer login</h1><p>Entre na sua conta para continuar</p></div>
          <form onSubmit={handleLogin} noValidate>
            <div className="field-group"><label htmlFor="login-email">E-mail</label><div className="input-shell"><MailIcon /><input id="login-email" type="email" autoComplete="email" placeholder="mail@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} /></div></div>
            <div className="field-group"><label htmlFor="login-password">Senha</label><div className="input-shell"><LockIcon /><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isLoading} /><button type="button" className="icon-button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((visible) => !visible)}><EyeIcon hidden={!showPassword} /></button></div></div>
            <div className="form-options"><label className="remember-option"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} disabled={isLoading} /><span className="checkbox-mark" /><span>Lembrar-me</span></label><button type="button" className="text-button" onClick={() => setNotice('A recuperação de senha estará disponível em breve.')}>Recuperar senha</button></div>
            {errorMessage && <p className="feedback feedback-error" role="alert">{errorMessage}</p>}{notice && <p className="feedback feedback-success" role="status">{notice}</p>}
            <button type="submit" className="primary-button" disabled={isLoading}>{isLoading ? 'Entrando...' : 'Entrar'}</button>
          </form>
          <div className="divider"><span>ou</span></div><div className="signup-block"><p>Ainda não tem uma conta?</p><button type="button" className="signup-button" onClick={() => changeView('signup')}><UserPlusIcon />Criar conta</button></div>
        </section>
      ) : (
        <section className="login-card signup-card" aria-labelledby="signup-title">
          <div className="login-heading"><h1 id="signup-title">Criar conta</h1><p>Comece a controlar suas finanças ainda hoje</p></div>
          <form onSubmit={handleSignUp} noValidate>
            <div className="field-group"><label htmlFor="signup-name">Nome completo</label><div className="input-shell"><UserIcon /><input id="signup-name" type="text" autoComplete="name" placeholder="Seu nome completo" value={fullName} onChange={(event) => setFullName(event.target.value)} disabled={isLoading} /></div></div>
            <div className="field-group"><label htmlFor="signup-email">E-mail</label><div className="input-shell"><MailIcon /><input id="signup-email" type="email" autoComplete="email" placeholder="mail@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} /></div></div>
            <div className="field-group signup-password-field"><label htmlFor="signup-password">Senha</label><div className="input-shell"><LockIcon /><input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Digite sua senha" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isLoading} /><button type="button" className="icon-button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((visible) => !visible)}><EyeIcon hidden={!showPassword} /></button></div><small>A senha deve ter no mínimo 8 caracteres</small></div>
            {errorMessage && <p className="feedback feedback-error" role="alert">{errorMessage}</p>}{notice && <p className="feedback feedback-success" role="status">{notice}</p>}
            <button type="submit" className="primary-button" disabled={isLoading}>{isLoading ? 'Cadastrando...' : 'Cadastrar'}</button>
          </form>
          <div className="divider"><span>ou</span></div><div className="signup-block"><p>Já tem uma conta?</p><button type="button" className="signup-button" onClick={() => changeView('login')}><LoginIcon />Fazer login</button></div>
        </section>
      )}
    </main>
  )
}

export default App
