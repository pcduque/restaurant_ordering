import { LogIn } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { login, register } from '../api/auth.api'
import { getApiErrorMessage } from '../api/client'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { useAuthStore } from '../store/auth.store'

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('demo1234')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const token = useAuthStore((state) => state.token)
  const setSession = useAuthStore((state) => state.setSession)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/'

  if (token) {
    return <Navigate to={redirectTo} replace />
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const session = mode === 'login' ? await login({ username, password }) : await register({ username, password })
      setSession(session)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 py-10 lg:grid-cols-[1fr_420px] lg:items-center">
      <section>
        <p className="text-sm font-black uppercase text-[#a42d08]">Private ordering</p>
        <h1 className="mt-3 font-serif text-5xl font-black leading-tight text-[#17150f] sm:text-6xl">
          Sign in to keep your orders separate.
        </h1>
        <p className="mt-6 max-w-xl text-xl leading-8 text-[#5f5a54]">
          Use the demo account or create a quick user. Orders, idempotency keys, and timeline events are scoped to that user.
        </p>
      </section>

      <form className="rounded-[24px] border border-[#dfd3c5] bg-[#eeeadf] p-8 shadow-sm" onSubmit={submit}>
        <div className="flex rounded-full bg-[#ded7cd] p-1 text-sm font-bold">
          <button
            className={`flex-1 rounded-full px-4 py-3 ${mode === 'login' ? 'bg-[#17150f] text-white' : 'text-[#5f5a54]'}`}
            type="button"
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 rounded-full px-4 py-3 ${mode === 'register' ? 'bg-[#17150f] text-white' : 'text-[#5f5a54]'}`}
            type="button"
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-bold uppercase text-[#5f5a54]">Username</span>
            <input
              className="mt-2 w-full rounded-[14px] border border-[#d7b9a8] bg-[#fffaf3] px-4 py-4 text-lg text-[#17150f]"
              value={username}
              minLength={3}
              maxLength={40}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold uppercase text-[#5f5a54]">Password</span>
            <input
              className="mt-2 w-full rounded-[14px] border border-[#d7b9a8] bg-[#fffaf3] px-4 py-4 text-lg text-[#17150f]"
              value={password}
              type="password"
              minLength={4}
              maxLength={100}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        </div>

        {error ? <div className="mt-6"><ErrorState title="Authentication failed" message={error} /></div> : null}

        <Button className="mt-8 w-full" disabled={loading} type="submit">
          <LogIn className="h-4 w-4" />
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
        </Button>
      </form>
    </div>
  )
}
