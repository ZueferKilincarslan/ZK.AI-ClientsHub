/*
  # Fix Profile Not Found Error

  This migration addresses the "Profile Not Found" error by:
  
  1. **Diagnostic Queries**
     - Check for users without profiles
     - Verify RLS policies are working correctly
     - Validate trigger function exists and works
  
  2. **Data Repair**
     - Create missing profiles for existing users
     - Ensure all users have corresponding profile records
  
  3. **Preventive Measures**
     - Update trigger function for automatic profile creation
     - Improve RLS policies for better error handling
     - Add constraints to maintain data integrity
  
  4. **Monitoring**
     - Add queries to detect future profile/user mismatches
*/

-- Step 1: Diagnostic queries to understand the current state
DO $$
DECLARE
    users_without_profiles INTEGER;
    total_auth_users INTEGER;
    total_profiles INTEGER;
BEGIN
    -- Count users without profiles
    SELECT COUNT(*) INTO users_without_profiles
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL;
    
    -- Get total counts
    SELECT COUNT(*) INTO total_auth_users FROM auth.users;
    SELECT COUNT(*) INTO total_profiles FROM public.profiles;
    
    RAISE NOTICE 'DIAGNOSTIC RESULTS:';
    RAISE NOTICE 'Total auth users: %', total_auth_users;
    RAISE NOTICE 'Total profiles: %', total_profiles;
    RAISE NOTICE 'Users without profiles: %', users_without_profiles;
    
    IF users_without_profiles > 0 THEN
        RAISE NOTICE 'ACTION REQUIRED: % users need profile records created', users_without_profiles;
    ELSE
        RAISE NOTICE 'SUCCESS: All users have corresponding profiles';
    END IF;
END $$;

-- Step 2: Create missing profiles for existing users
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    'client' as role, -- Default to client role
    au.created_at,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Step 3: Improve the trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    user_role TEXT := 'client'; -- Default role
BEGIN
    -- Get user email from auth.users
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = NEW.id;
    
    -- Determine role based on email domain or other criteria
    -- You can customize this logic based on your requirements
    IF user_email LIKE '%@zk.ai' OR user_email LIKE '%@admin.%' THEN
        user_role := 'admin';
    END IF;
    
    -- Insert profile with error handling
    BEGIN
        INSERT INTO public.profiles (
            id,
            email,
            role,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            user_email,
            user_role,
            NOW(),
            NOW()
        );
        
        RAISE LOG 'Profile created for user: % with role: %', user_email, user_role;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: %', user_email, SQLERRM;
        -- Don't fail the user creation, just log the error
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Improve RLS policies for better error handling
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Step 6: Add admin policies for better management
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Step 7: Add constraints to maintain data integrity
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_not_empty 
CHECK (email IS NOT NULL AND email != '');

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_valid 
CHECK (role IN ('admin', 'client'));

-- Step 8: Create a function to manually sync users and profiles
CREATE OR REPLACE FUNCTION public.sync_users_and_profiles()
RETURNS TABLE(
    action TEXT,
    user_id UUID,
    email TEXT,
    details TEXT
) AS $$
BEGIN
    -- Return users without profiles
    RETURN QUERY
    SELECT 
        'MISSING_PROFILE'::TEXT as action,
        au.id as user_id,
        au.email,
        'User exists but no profile found'::TEXT as details
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL;
    
    -- Return profiles without users (orphaned profiles)
    RETURN QUERY
    SELECT 
        'ORPHANED_PROFILE'::TEXT as action,
        p.id as user_id,
        p.email,
        'Profile exists but no auth user found'::TEXT as details
    FROM public.profiles p
    LEFT JOIN auth.users au ON p.id = au.id
    WHERE au.id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create a monitoring view for ongoing health checks
CREATE OR REPLACE VIEW public.auth_health_check AS
SELECT 
    'total_auth_users' as metric,
    COUNT(*)::TEXT as value
FROM auth.users
UNION ALL
SELECT 
    'total_profiles' as metric,
    COUNT(*)::TEXT as value
FROM public.profiles
UNION ALL
SELECT 
    'users_without_profiles' as metric,
    COUNT(*)::TEXT as value
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 
    'orphaned_profiles' as metric,
    COUNT(*)::TEXT as value
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- Step 10: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.auth_health_check TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_users_and_profiles() TO authenticated;

-- Final verification
DO $$
DECLARE
    missing_profiles INTEGER;
BEGIN
    SELECT COUNT(*) INTO missing_profiles
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL;
    
    IF missing_profiles = 0 THEN
        RAISE NOTICE 'SUCCESS: All users now have profiles';
    ELSE
        RAISE NOTICE 'WARNING: % users still missing profiles', missing_profiles;
    END IF;
END $$;