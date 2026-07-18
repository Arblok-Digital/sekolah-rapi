import { createSupabaseClient } from './client';

export const signIn = async (email: string, password: string) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUp = async (email: string, password: string) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const supabase = createSupabaseClient();
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};
