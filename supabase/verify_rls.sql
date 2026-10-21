-- ==============================================================================
-- Make My Marriage - RLS Verification & Test Script
-- Run this script in Supabase SQL editor to test the 4 access personas:
-- 1. Owner
-- 2. Authorized Member
-- 3. Unrelated Authenticated User
-- 4. Anonymous Visitor
-- ==============================================================================

DO $$
DECLARE
    v_owner_id UUID := '11111111-1111-1111-1111-111111111111';
    v_member_id UUID := '22222222-2222-2222-2222-222222222222';
    v_unrelated_id UUID := '33333333-3333-3333-3333-333333333333';
    v_wedding_id UUID;
    v_expense_id UUID;
    v_test_count INT;
BEGIN
    RAISE NOTICE '--- Starting RLS Verification Tests ---';

    -- Clean up previous test artifacts if any
    DELETE FROM public.weddings WHERE bride_name = 'RLS_Test_Bride';

    -- 1. Create a test wedding as Owner
    INSERT INTO public.weddings (
        owner_user_id,
        bride_name,
        groom_name,
        wedding_date,
        total_budget_paise,
        invitation_slug,
        invitation_published,
        rsvp_enabled
    ) VALUES (
        v_owner_id,
        'RLS_Test_Bride',
        'RLS_Test_Groom',
        CURRENT_DATE + INTERVAL '60 days',
        50000000, -- 5 Lakhs INR in paise
        'rls-test-wedding',
        true,
        true
    ) RETURNING id INTO v_wedding_id;

    RAISE NOTICE 'Created test wedding: %', v_wedding_id;

    -- Verify trigger automatically added owner to wedding_members
    SELECT COUNT(*) INTO v_test_count FROM public.wedding_members 
    WHERE wedding_id = v_wedding_id AND user_id = v_owner_id AND role = 'owner';
    IF v_test_count = 1 THEN
        RAISE NOTICE 'PASS: Owner auto-membership trigger verified.';
    ELSE
        RAISE EXCEPTION 'FAIL: Owner auto-membership trigger failed.';
    END IF;

    -- 2. Add an Authorized Member (Editor)
    INSERT INTO public.wedding_members (wedding_id, user_id, family_side, role)
    VALUES (v_wedding_id, v_member_id, 'bride', 'editor');

    -- 3. Add an Expense as Owner
    INSERT INTO public.expenses (
        wedding_id,
        title,
        category,
        total_amount_paise,
        amount_paid_paise,
        paying_side,
        created_by
    ) VALUES (
        v_wedding_id,
        'Test Wedding Hall Booking',
        'venue',
        25000000,
        10000000,
        'shared',
        v_owner_id
    ) RETURNING id INTO v_expense_id;

    RAISE NOTICE 'Created test expense: %', v_expense_id;

    -- 4. Verify helper function public.is_wedding_member
    -- Set auth context to owner
    PERFORM set_config('request.jwt.claim.sub', v_owner_id::text, true);
    PERFORM set_config('role', 'authenticated', true);
    IF public.is_wedding_member(v_wedding_id) THEN
        RAISE NOTICE 'PASS: is_wedding_member returned true for owner.';
    ELSE
        RAISE EXCEPTION 'FAIL: is_wedding_member failed for owner.';
    END IF;

    -- Set auth context to member
    PERFORM set_config('request.jwt.claim.sub', v_member_id::text, true);
    PERFORM set_config('role', 'authenticated', true);
    IF public.is_wedding_member(v_wedding_id) THEN
        RAISE NOTICE 'PASS: is_wedding_member returned true for authorized member.';
    ELSE
        RAISE EXCEPTION 'FAIL: is_wedding_member failed for authorized member.';
    END IF;

    -- Set auth context to unrelated user
    PERFORM set_config('request.jwt.claim.sub', v_unrelated_id::text, true);
    PERFORM set_config('role', 'authenticated', true);
    IF NOT public.is_wedding_member(v_wedding_id) THEN
        RAISE NOTICE 'PASS: is_wedding_member returned false for unrelated user.';
    ELSE
        RAISE EXCEPTION 'FAIL: unrelated user was incorrectly authorized.';
    END IF;

    -- 5. Test Public RSVP submission (Anonymous)
    PERFORM set_config('role', 'anon', true);
    PERFORM set_config('request.jwt.claim.sub', '', true);

    INSERT INTO public.rsvp_submissions (
        wedding_id,
        guest_name,
        response,
        attendees_count
    ) VALUES (
        v_wedding_id,
        'Public Guest Test',
        'attending',
        2
    );
    RAISE NOTICE 'PASS: Anonymous public RSVP submission permitted on published wedding.';

    -- 6. Test Public invitation view (Anonymous)
    SELECT COUNT(*) INTO v_test_count FROM public.public_wedding_invitations 
    WHERE id = v_wedding_id;
    IF v_test_count = 1 THEN
        RAISE NOTICE 'PASS: Anonymous visitor can view public published invitation.';
    ELSE
        RAISE EXCEPTION 'FAIL: Anonymous visitor could not read public wedding invitation view.';
    END IF;

    -- Clean up test records
    DELETE FROM public.weddings WHERE id = v_wedding_id;
    RAISE NOTICE 'Cleaned up test wedding.';
    RAISE NOTICE '--- All RLS Verification Tests Succeeded! ---';
END $$;
