import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql'
type AuthView = 'login' | 'signup'
type AppView = AuthView | 'dashboard'
type TransactionType = 'EXPENSE' | 'INCOME'
type User = { id: string; fullName: string; email: string }
type Category = { id: string; name: string }
type Transaction = { id: string; amount: number; type: TransactionType; description: string; categoryId: string; category: Category; createdAt: string }
type GraphQLResult = { data?: Record<string, any>; errors?: Array<{ message: string }> }

function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    mail: <><path d="M4 6.5h16v11H4z" /><path d="m4 7 8 6 8-6" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    user: <><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    eye: <><path d="M3.5 12s3.2-5 8.5-5 8.5 5 8.5 5-3.2 5-8.5 5-8.5-5-8.5-5Z" /><circle cx="12" cy="12" r="2" /></>,
    eyeOff: <><path d="M3.5 12s3.2-5 8.5-5 8.5 5 8.5 5-3.2 5-8.5 5-8.5-5-8.5-5Z" /><path d="m4 4 16 16" /></>,
    plusUser: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M18 8v6M15 11h6" /></>,
    login: <><path d="M14 5h5v14h-5M11 12h8M14 9l3 3-3 3" /><path d="M5 12h8" /></>,
    wallet: <><path d="M4 7h15v13H4z" /><path d="M4 7V5h13v2M15 13h5" /><circle cx="16" cy="13" r=".7" /></>,
    arrowUp: <><circle cx="12" cy="12" r="8" /><path d="m8.5 13 3.5-3.5 3.5 3.5M12 9.5v7" /></>,
    arrowDown: <><circle cx="12" cy="12" r="8" /><path d="m8.5 11 3.5 3.5 3.5-3.5M12 14.5v-7" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    chevron: <path d="m7 9 5 5 5-5" />,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    logout: <><path d="M10 5H5v14h5M14 12H4M16 9l3 3-3 3" /></>,
  }
  return <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

function Logo() {
  return <div className="brand" aria-label="Financy"><span className="brand-mark" aria-hidden="true"><span /></span><span className="brand-name">FINANCY</span></div>
}

async function requestGraphQL(query: string, variables: Record<string, unknown> = {}, token = '') {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ query, variables }),
  })
  const result = (await response.json()) as GraphQLResult
  if (!response.ok || result.errors?.length) throw new Error(result.errors?.[0]?.message ?? 'Não foi possível conectar à API.')
  return result
}

function AuthScreen({ mode, onChange, onSuccess }: { mode: AuthView; onChange: (view: AuthView) => void; onSuccess: (token: string, user?: User) => void }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setNotice('')
    if (mode === 'signup' && !fullName.trim()) return setErrorMessage('Informe seu nome completo.')
    if (!email.trim() || !password) return setErrorMessage('Preencha seu e-mail e sua senha.')
    if (mode === 'signup' && password.length < 8) return setErrorMessage('A senha deve ter no mínimo 8 caracteres.')
    setIsLoading(true)
    try {
      if (mode === 'signup') {
        await requestGraphQL(
          'mutation SignUp($fullName: String!, $email: String!, $password: String!) { signUp(fullName: $fullName, email: $email, password: $password) { id } }',
          { fullName: fullName.trim(), email: email.trim(), password },
        )
        setNotice('Conta criada. Entre para continuar.')
        onChange('login')
      } else {
        const result = await requestGraphQL(
          'mutation SignIn($email: String!, $password: String!) { signIn(email: $email, password: $password) { token user { id fullName email } } }',
          { email: email.trim(), password },
        )
        const auth = result.data?.signIn
        if (!auth?.token) throw new Error('Não foi possível entrar agora.')
        const storage = rememberMe ? localStorage : sessionStorage
        storage.setItem('financy_token', auth.token)
        onSuccess(auth.token, auth.user)
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível concluir a operação.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <header className="page-header"><Logo /></header>
      <section className="login-card" aria-labelledby="auth-title">
        <div className="login-heading">
          <h1 id="auth-title">{mode === 'login' ? 'Fazer login' : 'Criar conta'}</h1>
          <p>{mode === 'login' ? 'Entre na sua conta para continuar' : 'Comece a controlar suas finanças ainda hoje'}</p>
        </div>
        <form onSubmit={submit} noValidate>
          {mode === 'signup' && <div className="field-group"><label htmlFor="signup-name">Nome completo</label><div className="input-shell"><Icon name="user" /><input id="signup-name" autoComplete="name" placeholder="Seu nome completo" value={fullName} onChange={(event) => setFullName(event.target.value)} disabled={isLoading} /></div></div>}
          <div className="field-group"><label htmlFor="auth-email">E-mail</label><div className="input-shell"><Icon name="mail" /><input id="auth-email" type="email" autoComplete="email" placeholder="mail@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} /></div></div>
          <div className="field-group"><label htmlFor="auth-password">Senha</label><div className="input-shell"><Icon name="lock" /><input id="auth-password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Digite sua senha" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isLoading} /><button type="button" className="icon-button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((visible) => !visible)}><Icon name={showPassword ? 'eye' : 'eyeOff'} /></button></div>{mode === 'signup' && <small>A senha deve ter no mínimo 8 caracteres</small>}</div>
          {mode === 'login' && <div className="form-options"><label className="remember-option"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} disabled={isLoading} /><span className="checkbox-mark" /><span>Lembrar-me</span></label><button type="button" className="text-button" onClick={() => setNotice('A recuperação de senha estará disponível em breve.')}>Recuperar senha</button></div>}
          {errorMessage && <p className="feedback feedback-error" role="alert">{errorMessage}</p>}
          {notice && <p className="feedback feedback-success" role="status">{notice}</p>}
          <button type="submit" className="primary-button" disabled={isLoading}>{isLoading ? (mode === 'login' ? 'Entrando...' : 'Cadastrando...') : (mode === 'login' ? 'Entrar' : 'Cadastrar')}</button>
        </form>
        <div className="divider"><span>ou</span></div>
        <div className="signup-block"><p>{mode === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}</p><button type="button" className="signup-button" onClick={() => onChange(mode === 'login' ? 'signup' : 'login')}><Icon name={mode === 'login' ? 'plusUser' : 'login'} />{mode === 'login' ? 'Criar conta' : 'Fazer login'}</button></div>
      </section>
    </main>
  )
}

function money(value: number) { return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function dateLabel(date: string) { return new Date(date).toLocaleDateString('pt-BR') }

function Dashboard({ token, user, onLogout }: { token: string; user?: User; onLogout: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [transactionType, setTransactionType] = useState<TransactionType>('EXPENSE')
  const [saving, setSaving] = useState(false)

  async function loadDashboard() {
    setIsLoading(true)
    try {
      const result = await requestGraphQL('query Dashboard { transactions { id amount type description categoryId createdAt category { id name } } categories { id name } }', {}, token)
      setTransactions(result.data?.transactions ?? [])
      setCategories(result.data?.categories ?? [])
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar o dashboard.')
    } finally { setIsLoading(false) }
  }

  useEffect(() => { void loadDashboard() }, [])

  async function saveTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!description.trim() || !amount || !categoryId) return setErrorMessage('Preencha descrição, valor e categoria.')
    setSaving(true)
    try {
      await requestGraphQL('mutation CreateTransaction($amount: Float!, $description: String!, $categoryId: ID!, $type: TransactionType!) { createTransaction(amount: $amount, description: $description, categoryId: $categoryId, type: $type) { id } }', { amount: Number(amount.replace(',', '.')), description: description.trim(), categoryId, type: transactionType }, token)
      setDescription(''); setAmount(''); setCategoryId(''); setIsModalOpen(false)
      await loadDashboard()
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar a transação.') }
    finally { setSaving(false) }
  }

  const income = transactions.filter((item) => item.type === 'INCOME').reduce((sum, item) => sum + item.amount, 0)
  const expense = transactions.filter((item) => item.type === 'EXPENSE').reduce((sum, item) => sum + item.amount, 0)
  const balance = income - expense
  const displayName = user?.fullName?.trim() || user?.email?.split('@')[0] || 'Usuário'
  const visibleTransactions = transactions.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5)
  const openModal = () => setIsModalOpen(true)

  return (
    <main className="dashboard-page">
      <header className="dashboard-header"><Logo /><nav className="dashboard-nav" aria-label="Navegação principal">{['Dashboard', 'Transações', 'Categorias'].map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav><div className="user-menu"><span>{displayName.slice(0, 2).toUpperCase()}</span><button aria-label="Sair" onClick={onLogout}><Icon name="logout" /></button></div></header>
      <section className="dashboard-content">
        <div className="dashboard-welcome"><div><p className="eyebrow">Visão geral</p><h1>Olá, {displayName.split(' ')[0]}!</h1><p>Acompanhe sua vida financeira de perto.</p></div><button className="new-transaction-button" onClick={openModal}><Icon name="plus" />Nova transação</button></div>
        {errorMessage && <p className="dashboard-error" role="alert">{errorMessage}</p>}
        {activeTab === 'Dashboard' ? <>
          <div className="summary-grid"><article className="summary-card balance"><div><span className="summary-label">Saldo total</span><strong>{money(balance)}</strong></div><Icon name="wallet" /></article><article className="summary-card income"><div><span className="summary-label">Receitas do mês</span><strong>{money(income)}</strong></div><Icon name="arrowUp" /></article><article className="summary-card expense"><div><span className="summary-label">Despesas do mês</span><strong>{money(expense)}</strong></div><Icon name="arrowDown" /></article></div>
          <div className="dashboard-grid"><section className="panel transactions-panel"><div className="panel-header"><div><span className="panel-kicker">Movimentações</span><h2>Transações recentes</h2></div><button className="link-button" onClick={() => setActiveTab('Transações')}>Ver todas <span>›</span></button></div>{isLoading ? <p className="empty-state">Carregando suas transações...</p> : visibleTransactions.length === 0 ? <p className="empty-state">Você ainda não possui transações.</p> : <div className="transaction-list">{visibleTransactions.map((item) => <div className="transaction-row" key={item.id}><div className={`transaction-icon ${item.type.toLowerCase()}`}><Icon name={item.type === 'INCOME' ? 'arrowUp' : 'arrowDown'} /></div><div className="transaction-description"><strong>{item.description}</strong><span>{dateLabel(item.createdAt)}</span></div><span className={`transaction-category ${item.type.toLowerCase()}`}>{item.category.name}</span><strong className={`transaction-amount ${item.type.toLowerCase()}`}>{item.type === 'INCOME' ? '+' : '-'} {money(item.amount)}</strong></div>)}</div>}<button className="panel-action" onClick={openModal}><Icon name="plus" />Nova transação</button></section>
            <section className="panel categories-panel"><div className="panel-header"><div><span className="panel-kicker">Organização</span><h2>Categorias</h2></div><button className="link-button" onClick={() => setActiveTab('Categorias')}>Gerenciar <span>›</span></button></div>{categories.length === 0 ? <p className="empty-state">Nenhuma categoria cadastrada.</p> : <div className="category-list">{categories.slice(0, 6).map((category, index) => { const total = transactions.filter((item) => item.categoryId === category.id).reduce((sum, item) => sum + item.amount, 0); return <div className="category-row" key={category.id}><span className={`category-dot color-${index % 5}`} /><strong>{category.name}</strong><span>{transactions.filter((item) => item.categoryId === category.id).length} itens</span><b>{money(total)}</b></div> })}</div>}</section>
          </div>
        </> : <section className="panel placeholder-panel"><h2>{activeTab}</h2><p>Esta área receberá o layout de {activeTab.toLowerCase()} na próxima etapa.</p></section>}
      </section>
      {isModalOpen && <div className="modal-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsModalOpen(false)}><section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-title"><div className="modal-heading"><div><h2 id="transaction-title">Nova transação</h2><p>Registre sua despesa ou receita</p></div><button className="modal-close" aria-label="Fechar" onClick={() => setIsModalOpen(false)}><Icon name="close" /></button></div><div className="transaction-type-toggle"><button type="button" className={transactionType === 'EXPENSE' ? 'selected expense' : ''} onClick={() => setTransactionType('EXPENSE')}><Icon name="arrowDown" />Despesa</button><button type="button" className={transactionType === 'INCOME' ? 'selected income' : ''} onClick={() => setTransactionType('INCOME')}><Icon name="arrowUp" />Receita</button></div><form onSubmit={saveTransaction}><div className="field-group"><label htmlFor="transaction-description">Descrição</label><input id="transaction-description" className="plain-input" placeholder="Ex. Almoço no restaurante" value={description} onChange={(event) => setDescription(event.target.value)} /></div><div className="modal-fields"><div className="field-group"><label htmlFor="transaction-amount">Valor</label><input id="transaction-amount" className="plain-input" inputMode="decimal" placeholder="R$ 0,00" value={amount} onChange={(event) => setAmount(event.target.value)} /></div><div className="field-group"><label htmlFor="transaction-category">Categoria</label><div className="select-shell"><select id="transaction-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Selecione</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><Icon name="chevron" /></div></div></div>{categories.length === 0 && <p className="modal-hint">Cadastre uma categoria antes de criar uma transação.</p>}<button type="submit" className="primary-button" disabled={saving || categories.length === 0}>{saving ? 'Salvando...' : 'Salvar'}</button></form></section></div>}
    </main>
  )
}

function App() {
  const [view, setView] = useState<AppView>('login')
  const [token, setToken] = useState(() => localStorage.getItem('financy_token') || sessionStorage.getItem('financy_token') || '')
  const [user, setUser] = useState<User>()
  if (view === 'dashboard' && token) return <Dashboard token={token} user={user} onLogout={() => { localStorage.removeItem('financy_token'); sessionStorage.removeItem('financy_token'); setToken(''); setUser(undefined); setView('login') }} />
  const authView: AuthView = view === 'signup' ? 'signup' : 'login'
  return <AuthScreen mode={authView} onChange={setView} onSuccess={(newToken, newUser) => { setToken(newToken); setUser(newUser); setView('dashboard') }} />
}

export default App
