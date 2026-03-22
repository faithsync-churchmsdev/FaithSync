import { supabase } from './supabase';

const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL;

// ── SUPER ADMIN ───────────────────────────────────────────────────────────────
export async function superAdminLogin(email, password) {
  if (email !== SUPER_ADMIN_EMAIL) {
    return { error: 'Not authorized as Super Admin.' };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  // Verify it's actually in super_admins table
  const { data: sa } = await supabase
    .from('super_admins')
    .select('id')
    .eq('email', email)
    .single();
  if (!sa) return { error: 'Not authorized as Super Admin.' };
  return { data, role: 'superadmin' };
}

// ── CLERK ─────────────────────────────────────────────────────────────────────
export async function clerkLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  // Check clerk_accounts table
  const { data: clerk } = await supabase
    .from('clerk_accounts')
    .select('*, churches(*)')
    .eq('email', email)
    .single();

  if (!clerk) return { error: 'No clerk account found for this email.' };
  if (!clerk.active) return { error: 'Your account is pending activation by the Super Admin.' };
  if (clerk.churches?.status === 'suspended') return { error: 'Your church account has been suspended.' };

  return { data, clerk, church: clerk.churches, role: 'clerk' };
}

// ── LOGOUT ────────────────────────────────────────────────────────────────────
export async function logout() {
  await supabase.auth.signOut();
}

// ── GET CURRENT SESSION ───────────────────────────────────────────────────────
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── CHURCH REGISTRATION ───────────────────────────────────────────────────────
export async function registerChurch(formData) {
  const {
    churchName, address, diocese, contactNumber, email,
    churchHeadName, churchHeadTitle,
    registrantName, registrantGender,
    password
  } = formData;

  // 1. Create auth user in Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: null }
  });
  if (authError) return { error: authError.message };

  // 2. Insert church record
  const { data: church, error: churchError } = await supabase
    .from('churches')
    .insert({
      church_name: churchName,
      address,
      diocese,
      contact_number: contactNumber,
      email,
      church_head_name: churchHeadName,
      church_head_title: churchHeadTitle,
      registrant_name: registrantName,
      registrant_gender: registrantGender,
      status: 'pending'
    })
    .select()
    .single();
  if (churchError) return { error: churchError.message };

  // 3. Insert clerk account (inactive until super admin approves)
  const { error: clerkError } = await supabase
    .from('clerk_accounts')
    .insert({
      church_id: church.id,
      auth_user_id: authData.user?.id,
      email,
      first_name: registrantName,
      last_name: '',
      role: 'Clerk',
      parish: churchName,
      active: false
    });
  if (clerkError) return { error: clerkError.message };

  // 4. Sign out immediately — they can't use the app until approved
  await supabase.auth.signOut();

  return { success: true, church };
}

// ── SUPER ADMIN: APPROVE CHURCH ───────────────────────────────────────────────
export async function approveChurch(churchId, churchEmail) {
  // 1. Update church status to active
  const { error: churchError } = await supabase
    .from('churches')
    .update({ status: 'active' })
    .eq('id', churchId);
  if (churchError) return { error: churchError.message };

  // 2. Activate clerk account
  const { error: clerkError } = await supabase
    .from('clerk_accounts')
    .update({ active: true })
    .eq('church_id', churchId);
  if (clerkError) return { error: clerkError.message };

  // 3. Send approval email via Supabase
  await sendApprovalEmail(churchEmail);

  return { success: true };
}

// ── SUPER ADMIN: REJECT CHURCH ────────────────────────────────────────────────
export async function rejectChurch(churchId) {
  const { error } = await supabase
    .from('churches')
    .update({ status: 'suspended' })
    .eq('id', churchId);
  if (error) return { error: error.message };
  return { success: true };
}

// ── SUPER ADMIN: SUSPEND CHURCH ───────────────────────────────────────────────
export async function suspendChurch(churchId) {
  const { error } = await supabase
    .from('churches')
    .update({ status: 'suspended' })
    .eq('id', churchId);
  if (error) return { error: error.message };
  return { success: true };
}

// ── EMAIL NOTIFICATION (via Supabase Edge Function or mailto fallback) ─────────
async function sendApprovalEmail(email) {
  // We'll use Supabase's built-in email for now
  // This sends a magic link style notification
  try {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/?clerk=login`
    });
  } catch (e) {
    console.log('Email notification attempted:', email);
  }
}