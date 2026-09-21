import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql'

type LoginResponse = {
  data?: {
    signIn?: {
      token: string
      user: { id: string; email: string }
    }
  }
  errors?: Array<{ message: string }>
}

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h16v11H4z" /><path d="m4 7 8 6 8-6" /></svg>
}

function LockIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12s3.2-5 8.5-5 8.5 5 8.5 5-3.2 5-8.5 5-8.5-5-8.5-5Z" />{hidden ? <path d="m4 4 16 16" /> : <circle cx="12" cy="12" r="2" />}</svg>
}

function UserPlusIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M18 8v6M15 11h6" /></svg>
}

function Logo() {
  return <div className="brand" aria-label="Financy"><span className="brand-mark" aria-hidden="true"><span /></span><span className="brand-name">FINANCY</span></div>
}

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setNotice('')

    if (!email.trim() || !password) {
      setErrorMessage('Informe seu e-mail e sua senha para continuar.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation SignIn($email: String!, $password: String!) {
            signIn(email: $email, password: $password) {
              token
              user { id email }
            }
          }`,
          variables: { email: email.trim(), password },
        }),
      })

      const result = (await response.json()) as LoginResponse
      const token = result.data?.signIn?.token

      if (!response.ok || result.errors?.length || !token) {
        throw new Error(result.errors?.[0]?.message ?? 'Não foi possível entrar agora.')
      }

      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('financy_token', token)
      setNotice('Login realizado. Sua sessão está ativa.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível conectar à API.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleRecovery() {
    setErrorMessage('')
    setNotice('A recuperação de senha estará disponível em breve.')
  }

  function handleSignUp() {
    setErrorMessage('')
    setNotice('O cadastro estará disponível em breve.')
  }

  return (
    <main className="login-page">
      <header className="page-header"><Logo /></header>
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-heading">
          <h1 id="login-title">Fazer login</h1>
          <p>Entre na sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="email">E-mail</label>
            <div className="input-shell">
              <MailIcon />
              <input id="email" name="email" type="email" autoComplete="email" placeholder="mail@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="password">Senha</label>
            <div className="input-shell">
              <LockIcon />
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isLoading} />
              <button type="button" className="icon-button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((visible) => !visible)}><EyeIcon hidden={!showPassword} /></button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-option">
              <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} disabled={isLoading} />
              <span className="checkbox-mark" aria-hidden="true" /><span>Lembrar-me</span>
            </label>
            <button type="button" className="text-button" onClick={handleRecovery}>Recuperar senha</button>
          </div>

          {errorMessage && <p className="feedback feedback-error" role="alert">{errorMessage}</p>}
          {notice && <p className="feedback feedback-success" role="status">{notice}</p>}
          <button type="submit" className="primary-button" disabled={isLoading}>{isLoading ? 'Entrando...' : 'Entrar'}</button>
        </form>

        <div className="divider"><span>ou</span></div>
        <div className="signup-block">
          <p>Ainda não tem uma conta?</p>
          <button type="button" className="signup-button" onClick={handleSignUp}><UserPlusIcon />Criar conta</button>
        </div>
      </section>
    </main>
  )
}

export default App
