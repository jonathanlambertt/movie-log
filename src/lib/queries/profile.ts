import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

// The profiles row is the source of truth for identity — display name, handle
// and bio. Sign-up seeds display_name into auth metadata, but only so the
// handle_new_user trigger can copy it here; nothing reads that metadata.
export type Profile = {
  id: string;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
};

// RLS ("profiles: read own") scopes this to the caller, so no id filter is
// needed. maybeSingle rather than single: the row comes from a signup trigger,
// and a missing row should render an empty profile, not throw.
export function useMyProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, username, bio, avatar_url, created_at')
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

type UpdateProfileInput = {
  userId: string;
  displayName: string | null;
  username: string | null;
  bio: string | null;
};

// Update, never upsert: profiles has no insert policy (rows exist only via the
// signup trigger), so an upsert that fell through to INSERT would fail RLS.
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, displayName, username, bio }: UpdateProfileInput) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          username,
          bio,
        })
        .eq('id', userId);
      if (error) {
        // username is UNIQUE — turn the raw constraint violation into
        // something worth showing a user.
        if (error.code === '23505') {
          throw new Error('That username is taken. Try another.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
