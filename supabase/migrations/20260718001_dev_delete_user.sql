CREATE OR REPLACE FUNCTION dev_delete_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT is_dev() THEN
    RAISE EXCEPTION 'Access denied: dev role required';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete yourself';
  END IF;

  DELETE FROM public.spp_payments WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.transactions WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.students WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.categories WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.enrollment_requests WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.sync_queue WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.inventory_items WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.employees WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.payroll_records WHERE school_id IN (SELECT id FROM public.schools WHERE owner_id = target_user_id);
  DELETE FROM public.schools WHERE owner_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
