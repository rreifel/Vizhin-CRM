import { createClient } from '@supabase/supabase-js'

export const createAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !secretKey) {
    throw new Error("Missing Supabase configuration keys in .env.local file.")
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
'use server'
import { createAdminClient } from '@/utils/supabase-admin'

export async function bulkCreateUsers(users: any) {
  try {
    const adminClient = createAdminClient()
    let successCount = 0
    let errorCount = 0

    for (const user of users) {
      const email = user['Email Address']
      const role = user['Role'] || 'User'
      const managerEmail = user['Manager Email']
      const region = user['Team Assignment']

      if (!email || email.trim() === "") continue

      // This safely triggers the administrative account creator on the server side
      const { error } = await adminClient.auth.admin.createUser({
        email: email.trim(),
        password: 'TemporaryPassword123!',
        email_confirm: true,
        user_metadata: {
          role: role,
          manager_email: managerEmail,
          master_region: region
        }
      })

      if (error) {
        console.error(`Failed to create account for ${email}:`, error.message)
        errorCount++
      } else {
        successCount++
      }
    }

    return { successCount, errorCount }
  } catch (globalError: any) {
    console.error("Critical Server Crash:", globalError.message)
    throw new Error(globalError.message)
  }
}
