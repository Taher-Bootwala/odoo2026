'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const STATIC_USERS = [
  { email: 'admin@assetflow.com', password: 'admin@123', role: 'admin', full_name: 'Admin User' },
  { email: 'asset_man@gmail.com', password: 'asset@123', role: 'asset_manager', full_name: 'Asset Manager' },
  { email: 'dept_head@gmail.com', password: 'dept@123', role: 'department_head', full_name: 'Department Head' },
  { email: 'emp1@gmail.com', password: 'emp1@123', role: 'employee', full_name: 'Employee One' },
]

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Try standard sign in first
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (!error && data?.user) {
    // Login succeeded — ensure static users have correct roles
    const staticUser = STATIC_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (staticUser) {
      await supabase
        .from('users')
        .update({
          role: staticUser.role as any,
          full_name: staticUser.full_name,
        })
        .eq('id', data.user.id)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }

  // 2. Sign in failed — check if it's a known static user and auto-register them
  const staticUser = STATIC_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )

  if (staticUser) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: staticUser.full_name,
          email: email,
        },
      },
    })

    if (!signUpError && signUpData.user) {
      const signInRes = await supabase.auth.signInWithPassword({ email, password })

      if (!signInRes.error && signInRes.data?.user) {
        await supabase
          .from('users')
          .update({
            role: staticUser.role as any,
            full_name: staticUser.full_name,
          })
          .eq('id', signUpData.user.id)

        revalidatePath('/', 'layout')
        redirect('/dashboard')
      }
    }
  }

  // 3. All attempts failed
  redirect(`/login?error=${encodeURIComponent('Invalid login credentials')}`)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: email.split('@')[0],
        email: email,
      },
    },
  })

  if (error) {
    let message = error.message
    if (!message || message === '{}' || message === '{""}') {
      message = 'Sign up failed. A database error occurred — please check your Supabase database triggers.'
    }
    redirect(`/register?error=${encodeURIComponent(message)}`)
  }

  if (data?.user?.identities?.length === 0) {
    redirect(`/register?error=${encodeURIComponent('An account with this email already exists. Please sign in instead.')}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
