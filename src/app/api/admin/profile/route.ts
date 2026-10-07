import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAudit, computeChanges } from '@/lib/audit'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, created_at')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        last_sign_in_at: user.last_sign_in_at,
        created_at: user.created_at,
      },
      profile,
    })
  } catch (err: any) {
    console.error('Admin profile GET error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: currentProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role')
      .eq('id', user.id)
      .single()

    if (profileErr || !currentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (currentProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const body = await request.json()
    const fullName = (body.full_name ?? '').trim()
    const phone = (body.phone ?? '').trim()

    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }

    const updates = {
      full_name: fullName,
      phone: phone || null,
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // Log to Audit Logs
    const diff = computeChanges(
      { full_name: currentProfile.full_name, phone: currentProfile.phone },
      updates
    )

    if (Object.keys(diff).length > 0) {
      await logAudit({
        action: 'profile.update',
        entityType: 'profile',
        entityId: user.id,
        entityName: fullName,
        changes: diff,
      })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        ...currentProfile,
        ...updates,
      },
    })
  } catch (err: any) {
    console.error('Admin profile POST error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
