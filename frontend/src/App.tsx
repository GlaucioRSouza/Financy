import { useCallback, useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql'
type AuthView = 'login' | 'signup'
type AppView = AuthView | 'dashboard'
type TransactionType = 'EXPENSE' | 'INCOME'
type User = { id: string; fullName: string; email: string }
type Category = { id: string; name: string; description: string; icon: string; color: string }
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
    search: <><circle cx="10.8" cy="10.8" r="6" /><path d="m16 16 4 4" /></>,
    arrowRight: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    tag: <><path d="M4 5h7l8 8-6 6-8-8V5Z" /><circle cx="8" cy="9" r="1" /></>,
    edit: <><path d="m4 17-.8 3.8L7 20l11-11-3-3L4 17Z" /><path d="m13.5 7.5 3 3" /></>,
    trash: <><path d="M5 7h14M10 11v5M14 11v5M8 7l1-2h6l1 2m-9 0 1 13h10l1-13" /></>,
    utensil: <><path d="M7 4v7M4 4v3a3 3 0 0 0 6 0V4M7 10v10M15 4v16M15 4c4 1 4 6 0 8" /></>,
    ticket: <path d="M4 7a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4h16v-4a2 2 0 0 1 0-4V5H4a2 2 0 0 0 0 2Z" />,
    cart: <><circle cx="9" cy="19" r="1.5" /><circle cx="18" cy="19" r="1.5" /><path d="M3 4h2l2.5 11h11L21 8H6" /></>,
    briefcase: <><rect x="4" y="7" width="16" height="12" rx="2" /><path d="M9 7V5h6v2M4 12h16" /></>,
    heart: <path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2Z" />,
    car: <><path d="m5 16 1.5-6h11L19 16M4 16h16v3H4z" /><circle cx="7" cy="19" r="1" /><circle cx="17" cy="19" r="1" /></>,
    bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />,
    gift: <><rect x="4" y="9" width="16" height="11" rx="1" /><path d="M12 9v11M3 9h18M12 9H8a2 2 0 1 1 2-2c0 2 2 2 2 2Zm0 0h4a2 2 0 1 0-2-2c0 2-2 2-2 2Z" /></>,
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

function Profile({ token, user, onSaved, onLogout }: { token: string; user: User; onSaved: (user: User) => void; onLogout: () => void }) {
  const [fullName, setFullName] = useState(user.fullName)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const initials = (fullName || user.email).split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!fullName.trim()) return setErrorMessage('Informe seu nome completo.')
    setIsSaving(true)
    setMessage('')
    setErrorMessage('')
    try {
      const result = await requestGraphQL('mutation UpdateProfile($fullName: String!) { updateProfile(fullName: $fullName) { id fullName email } }', { fullName: fullName.trim() }, token)
      const updatedUser = result.data?.updateProfile as User
      onSaved(updatedUser)
      setMessage('Alterações salvas com sucesso.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar as alterações.')
    } finally { setIsSaving(false) }
  }

  return <section className="profile-page">
    <div className="profile-card">
      <div className="profile-identity"><div className="profile-avatar">{initials}</div><h1>{fullName || 'Sua conta'}</h1><p>{user.email}</p></div>
      <div className="profile-divider" />
      <form onSubmit={save}>
        <div className="field-group"><label htmlFor="profile-name">Nome completo</label><div className="input-shell"><Icon name="user" /><input id="profile-name" value={fullName} onChange={(event) => setFullName(event.target.value)} disabled={isSaving} /></div></div>
        <div className="field-group"><label htmlFor="profile-email">E-mail</label><div className="input-shell disabled-input"><Icon name="mail" /><input id="profile-email" value={user.email} disabled /><small>O e-mail não pode ser alterado</small></div></div>
        {errorMessage && <p className="feedback feedback-error" role="alert">{errorMessage}</p>}
        {message && <p className="feedback feedback-success" role="status">{message}</p>}
        <button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar alterações'}</button>
      </form>
      <button type="button" className="profile-logout" onClick={onLogout}><Icon name="arrowRight" />Sair da conta</button>
    </div>
  </section>
}

function TransactionsManager({ token, transactions, categories, onChanged, onNew }: { token: string; transactions: Transaction[]; categories: Category[]; onChanged: () => Promise<void>; onNew: () => void }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [editType, setEditType] = useState<TransactionType>('EXPENSE')
  const [editCategory, setEditCategory] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const pageSize = 8

  const filtered = transactions.filter((item) => {
    const matchesSearch = item.description.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter
    const matchesCategory = categoryFilter === 'ALL' || item.categoryId === categoryFilter
    return matchesSearch && matchesType && matchesCategory
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function openEdit(item: Transaction) {
    setEditing(item)
    setDescription(item.description)
    setAmount(String(item.amount).replace('.', ','))
    setEditType(item.type)
    setEditCategory(item.categoryId)
    setErrorMessage('')
  }

  async function remove(item: Transaction) {
    if (!window.confirm(`Excluir a transação "${item.description}"?`)) return
    try {
      await requestGraphQL('mutation DeleteTransaction($id: ID!) { deleteTransaction(id: $id) }', { id: item.id }, token)
      await onChanged()
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Não foi possível excluir a transação.') }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing || !description.trim() || !amount || !editCategory) return setErrorMessage('Preencha descrição, valor e categoria.')
    try {
      await requestGraphQL('mutation EditTransaction($id: ID!, $amount: Float, $description: String, $categoryId: ID, $type: TransactionType) { editTransaction(id: $id, amount: $amount, description: $description, categoryId: $categoryId, type: $type) { id } }', { id: editing.id, amount: Number(amount.replace(',', '.')), description: description.trim(), categoryId: editCategory, type: editType }, token)
      setEditing(null)
      await onChanged()
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Não foi possível editar a transação.') }
  }

  return <section className="transactions-page">
    <div className="transactions-heading"><div><p className="eyebrow">Movimentações</p><h1>Transações</h1><p>Gerencie todas as suas transações financeiras</p></div><button className="new-transaction-button" onClick={onNew}><Icon name="plus" />Nova transação</button></div>
    <div className="transaction-filters"><label>Buscar<div className="filter-input"><Icon name="search" /><input placeholder="Buscar por descrição" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></div></label><label>Tipo<select value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setPage(1) }}><option value="ALL">Todos</option><option value="EXPENSE">Saída</option><option value="INCOME">Entrada</option></select></label><label>Categoria<select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setPage(1) }}><option value="ALL">Todas</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Período<select defaultValue="ALL"><option value="ALL">Todos os períodos</option><option value="CURRENT">Este mês</option></select></label></div>
    {errorMessage && <p className="dashboard-error" role="alert">{errorMessage}</p>}
    <section className="transactions-table-panel"><div className="transactions-table-head"><span>Descrição</span><span>Data</span><span>Categoria</span><span>Tipo</span><span>Valor</span><span>Ações</span></div>{visible.length === 0 ? <p className="empty-state">Nenhuma transação encontrada.</p> : visible.map((item) => <div className="transactions-table-row" key={item.id}><div className="table-description"><span className={`transaction-icon small ${item.type.toLowerCase()}`}><Icon name={item.type === 'INCOME' ? 'arrowUp' : 'arrowDown'} /></span><strong>{item.description}</strong></div><span>{dateLabel(item.createdAt)}</span><span className={`category-pill color-${item.category.color}`}>{item.category.name}</span><span className={`table-type ${item.type.toLowerCase()}`}><Icon name={item.type === 'INCOME' ? 'arrowUp' : 'arrowDown'} />{item.type === 'INCOME' ? 'Entrada' : 'Saída'}</span><strong className={`table-amount ${item.type.toLowerCase()}`}>{item.type === 'INCOME' ? '+' : '-'} {money(item.amount)}</strong><div className="table-actions"><button aria-label={`Excluir ${item.description}`} onClick={() => void remove(item)}><Icon name="trash" /></button><button aria-label={`Editar ${item.description}`} onClick={() => openEdit(item)}><Icon name="edit" /></button></div></div>)}<div className="transactions-table-footer"><span>1 a {Math.min(filtered.length, pageSize)} de {filtered.length} resultados</span><div className="pagination"><button disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)}>‹</button>{Array.from({ length: pageCount }, (_, index) => index + 1).slice(0, 4).map((value) => <button key={value} className={currentPage === value ? 'active' : ''} onClick={() => setPage(value)}>{value}</button>)}<button disabled={currentPage === pageCount} onClick={() => setPage((value) => value + 1)}>›</button></div></div></section>
    {editing && <div className="modal-overlay" role="presentation"><section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="edit-transaction-title"><div className="modal-heading"><div><h2 id="edit-transaction-title">Editar transação</h2><p>Atualize os dados da movimentação</p></div><button className="modal-close" aria-label="Fechar" onClick={() => setEditing(null)}><Icon name="close" /></button></div><div className="transaction-type-toggle"><button type="button" className={editType === 'EXPENSE' ? 'selected expense' : ''} onClick={() => setEditType('EXPENSE')}><Icon name="arrowDown" />Despesa</button><button type="button" className={editType === 'INCOME' ? 'selected income' : ''} onClick={() => setEditType('INCOME')}><Icon name="arrowUp" />Receita</button></div><form onSubmit={saveEdit}><div className="field-group"><label htmlFor="edit-description">Descrição</label><input id="edit-description" className="plain-input" value={description} onChange={(event) => setDescription(event.target.value)} /></div><div className="modal-fields"><div className="field-group"><label htmlFor="edit-amount">Valor</label><input id="edit-amount" className="plain-input" value={amount} onChange={(event) => setAmount(event.target.value)} /></div><div className="field-group"><label htmlFor="edit-category">Categoria</label><select id="edit-category" className="plain-input" value={editCategory} onChange={(event) => setEditCategory(event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div></div>{errorMessage && <p className="feedback feedback-error" role="alert">{errorMessage}</p>}<button className="primary-button" type="submit">Salvar</button></form></section></div>}
  </section>
}

const categoryIcons = ['wallet', 'utensil', 'briefcase', 'cart', 'heart', 'car', 'ticket', 'gift']
const categoryColors = ['green', 'blue', 'purple', 'pink', 'red', 'orange', 'yellow']

function CategoryManager({ token, categories, transactions, onChanged }: { token: string; categories: Category[]; transactions: Transaction[]; onChanged: () => Promise<void> }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
    const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('wallet')
  const [color, setColor] = useState('green')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function openModal(category?: Category) {
    setEditing(category ?? null)
    setName(category?.name ?? '')
    setDescription(category?.description ?? '')
    setIcon(category?.icon ?? 'wallet')
    setColor(category?.color ?? 'green')
    setErrorMessage('')
    setIsModalOpen(true)
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return setErrorMessage('Informe um título para a categoria.')
    setIsSaving(true)
    try {
      const query = editing
        ? `mutation EditCategory($id: ID!, $name: String!, $description: String, $icon: String, $color: String) { editCategory(id: $id, name: $name, description: $description, icon: $icon, color: $color) { id } }`
        : `mutation CreateCategory($name: String!, $description: String, $icon: String, $color: String) { createCategory(name: $name, description: $description, icon: $icon, color: $color) { id } }`
      await requestGraphQL(query, { ...(editing ? { id: editing.id } : {}), name: name.trim(), description: description.trim(), icon, color }, token)
      setIsModalOpen(false)
      setErrorMessage('')
      await onChanged()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar a categoria.')
    } finally { setIsSaving(false) }
  }

  async function removeCategory(category: Category) {
    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) return
    try {
      await requestGraphQL('mutation DeleteCategory($id: ID!) { deleteCategory(id: $id) }', { id: category.id }, token)
      await onChanged()
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Não foi possível excluir a categoria.') }
  }

  const mostUsed = categories.slice().sort((a, b) => transactions.filter((item) => item.categoryId === b.id).length - transactions.filter((item) => item.categoryId === a.id).length)[0]
  const totalTransactions = transactions.length

  return <section className="categories-page">
    <div className="categories-heading"><div><p className="eyebrow">Organização</p><h1>Categorias</h1><p>Organize suas transações por categorias</p></div><button className="new-transaction-button" onClick={() => openModal()}><Icon name="plus" />Nova categoria</button></div>
    <div className="category-summary-grid"><article><Icon name="tag" /><strong>{categories.length}</strong><span>Total de categorias</span></article><article><Icon name="arrowUp" /><strong>{totalTransactions}</strong><span>Total de transações</span></article><article><Icon name="utensil" /><strong>{totalTransactions > 0 ? mostUsed?.name ?? 'Nenhuma' : 'Nenhuma'}</strong><span>Categoria mais utilizada</span></article></div>
    {errorMessage && <p className="dashboard-error" role="alert">{errorMessage}</p>}
    <div className="category-cards">{categories.length === 0 ? <div className="panel empty-categories"><Icon name="tag" /><h2>Comece criando uma categoria</h2><p>Use categorias para acompanhar melhor seus gastos.</p><button className="primary-button" onClick={() => openModal()}>Nova categoria</button></div> : categories.map((category) => { const count = transactions.filter((item) => item.categoryId === category.id).length; return <article className="category-card" key={category.id}><div className={`category-icon color-${category.color}`}><Icon name={category.icon} /></div><div className="category-actions"><button aria-label={`Excluir ${category.name}`} onClick={() => void removeCategory(category)}><Icon name="trash" /></button><button aria-label={`Editar ${category.name}`} onClick={() => openModal(category)}><Icon name="edit" /></button></div><h2>{category.name}</h2><p>{category.description || 'Sem descrição cadastrada'}</p><div className="category-card-footer"><span className={`category-pill color-${category.color}`}>{category.name}</span><span>{count} {count === 1 ? 'item' : 'itens'}</span></div></article> })}</div>
    {isModalOpen && <div className="modal-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsModalOpen(false)}><section className="category-modal" role="dialog" aria-modal="true" aria-labelledby="category-title"><div className="modal-heading"><div><h2 id="category-title">{editing ? 'Editar categoria' : 'Nova categoria'}</h2><p>Organize suas transações por categorias</p></div><button className="modal-close" aria-label="Fechar" onClick={() => setIsModalOpen(false)}><Icon name="close" /></button></div><form onSubmit={saveCategory}><div className="field-group"><label htmlFor="category-name">Título</label><input id="category-name" className="plain-input" placeholder="Ex. Alimentação" value={name} onChange={(event) => setName(event.target.value)} /></div><div className="field-group"><label htmlFor="category-description">Descrição</label><input id="category-description" className="plain-input" placeholder="Descrição da categoria" value={description} onChange={(event) => setDescription(event.target.value)} /><small>Opcional</small></div><div className="category-picker"><label>Ícone</label><div className="icon-options">{categoryIcons.map((item) => <button type="button" key={item} className={icon === item ? 'selected' : ''} aria-label={`Ícone ${item}`} onClick={() => setIcon(item)}><Icon name={item} /></button>)}</div></div><div className="category-picker"><label>Cor</label><div className="color-options">{categoryColors.map((item) => <button type="button" key={item} className={`color-swatch ${item} ${color === item ? 'selected' : ''}`} aria-label={`Cor ${item}`} onClick={() => setColor(item)} />)}</div></div>{errorMessage && <p className="feedback feedback-error" role="alert">{errorMessage}</p>}<button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar'}</button></form></section></div>}
  </section>
}

function Dashboard({ token, user, onLogout, onUserUpdated }: { token: string; user?: User; onLogout: () => void; onUserUpdated: (user: User) => void }) {
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

  const loadDashboard = useCallback(async () => {
    try {
      const result = await requestGraphQL('query Dashboard { transactions { id amount type description categoryId createdAt category { id name description icon color } } categories { id name description icon color } }', {}, token)
      setTransactions(result.data?.transactions ?? [])
      setCategories(result.data?.categories ?? [])
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar o dashboard.')
    } finally { setIsLoading(false) }
  }, [token])

  useEffect(() => { void loadDashboard() }, [loadDashboard])

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
      <header className="dashboard-header"><Logo /><nav className="dashboard-nav" aria-label="Navegação principal">{['Dashboard', 'Transações', 'Categorias'].map((tab) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav><div className="user-menu"><button className="avatar-button" aria-label="Abrir perfil" onClick={() => setActiveTab('Perfil')}>{displayName.slice(0, 2).toUpperCase()}</button><button aria-label="Sair" onClick={onLogout}><Icon name="logout" /></button></div></header>
      <section className="dashboard-content">
        {activeTab === 'Dashboard' && <div className="dashboard-welcome"><div><p className="eyebrow">Visão geral</p><h1>Olá, {displayName.split(' ')[0]}!</h1><p>Acompanhe sua vida financeira de perto.</p></div><button className="new-transaction-button" onClick={openModal}><Icon name="plus" />Nova transação</button></div>}
        {errorMessage && <p className="dashboard-error" role="alert">{errorMessage}</p>}
        {activeTab === 'Dashboard' ? <>
          <div className="summary-grid"><article className="summary-card balance"><div><span className="summary-label">Saldo total</span><strong>{money(balance)}</strong></div><Icon name="wallet" /></article><article className="summary-card income"><div><span className="summary-label">Receitas do mês</span><strong>{money(income)}</strong></div><Icon name="arrowUp" /></article><article className="summary-card expense"><div><span className="summary-label">Despesas do mês</span><strong>{money(expense)}</strong></div><Icon name="arrowDown" /></article></div>
          <div className="dashboard-grid"><section className="panel transactions-panel"><div className="panel-header"><div><span className="panel-kicker">Movimentações</span><h2>Transações recentes</h2></div><button className="link-button" onClick={() => setActiveTab('Transações')}>Ver todas <span>›</span></button></div>{isLoading ? <p className="empty-state">Carregando suas transações...</p> : visibleTransactions.length === 0 ? <p className="empty-state">Você ainda não possui transações.</p> : <div className="transaction-list">{visibleTransactions.map((item) => <div className="transaction-row" key={item.id}><div className={`transaction-icon ${item.type.toLowerCase()}`}><Icon name={item.type === 'INCOME' ? 'arrowUp' : 'arrowDown'} /></div><div className="transaction-description"><strong>{item.description}</strong><span>{dateLabel(item.createdAt)}</span></div><span className={`transaction-category ${item.type.toLowerCase()}`}>{item.category.name}</span><strong className={`transaction-amount ${item.type.toLowerCase()}`}>{item.type === 'INCOME' ? '+' : '-'} {money(item.amount)}</strong></div>)}</div>}<button className="panel-action" onClick={openModal}><Icon name="plus" />Nova transação</button></section>
            <section className="panel categories-panel"><div className="panel-header"><div><span className="panel-kicker">Organização</span><h2>Categorias</h2></div><button className="link-button" onClick={() => setActiveTab('Categorias')}>Gerenciar <span>›</span></button></div>{categories.length === 0 ? <p className="empty-state">Nenhuma categoria cadastrada.</p> : <div className="category-list">{categories.slice(0, 6).map((category, index) => { const total = transactions.filter((item) => item.categoryId === category.id).reduce((sum, item) => sum + item.amount, 0); return <div className="category-row" key={category.id}><span className={`category-dot color-${index % 5}`} /><strong>{category.name}</strong><span>{transactions.filter((item) => item.categoryId === category.id).length} itens</span><b>{money(total)}</b></div> })}</div>}</section>
          </div>
        </> : activeTab === 'Categorias' ? <CategoryManager token={token} categories={categories} transactions={transactions} onChanged={loadDashboard} /> : activeTab === 'Perfil' && user ? <Profile token={token} user={user} onSaved={onUserUpdated} onLogout={onLogout} /> : <TransactionsManager token={token} transactions={transactions} categories={categories} onChanged={loadDashboard} onNew={openModal} />}
      </section>
      {isModalOpen && <div className="modal-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsModalOpen(false)}><section className="transaction-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-title"><div className="modal-heading"><div><h2 id="transaction-title">Nova transação</h2><p>Registre sua despesa ou receita</p></div><button className="modal-close" aria-label="Fechar" onClick={() => setIsModalOpen(false)}><Icon name="close" /></button></div><div className="transaction-type-toggle"><button type="button" className={transactionType === 'EXPENSE' ? 'selected expense' : ''} onClick={() => setTransactionType('EXPENSE')}><Icon name="arrowDown" />Despesa</button><button type="button" className={transactionType === 'INCOME' ? 'selected income' : ''} onClick={() => setTransactionType('INCOME')}><Icon name="arrowUp" />Receita</button></div><form onSubmit={saveTransaction}><div className="field-group"><label htmlFor="transaction-description">Descrição</label><input id="transaction-description" className="plain-input" placeholder="Ex. Almoço no restaurante" value={description} onChange={(event) => setDescription(event.target.value)} /></div><div className="modal-fields"><div className="field-group"><label htmlFor="transaction-amount">Valor</label><input id="transaction-amount" className="plain-input" inputMode="decimal" placeholder="R$ 0,00" value={amount} onChange={(event) => setAmount(event.target.value)} /></div><div className="field-group"><label htmlFor="transaction-category">Categoria</label><div className="select-shell"><select id="transaction-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Selecione</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><Icon name="chevron" /></div></div></div>{categories.length === 0 && <p className="modal-hint">Cadastre uma categoria antes de criar uma transação.</p>}<button type="submit" className="primary-button" disabled={saving || categories.length === 0}>{saving ? 'Salvando...' : 'Salvar'}</button></form></section></div>}
    </main>
  )
}

function App() {
  const [view, setView] = useState<AppView>('login')
  const [token, setToken] = useState(() => localStorage.getItem('financy_token') || sessionStorage.getItem('financy_token') || '')
  const [user, setUser] = useState<User>()
  if (view === 'dashboard' && token && user) return <Dashboard token={token} user={user} onUserUpdated={setUser} onLogout={() => { localStorage.removeItem('financy_token'); sessionStorage.removeItem('financy_token'); setToken(''); setUser(undefined); setView('login') }} />
  const authView: AuthView = view === 'signup' ? 'signup' : 'login'
  return <AuthScreen mode={authView} onChange={setView} onSuccess={(newToken, newUser) => { setToken(newToken); setUser(newUser); setView('dashboard') }} />
}

export default App
