import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { IUser } from '@/types/common';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const setUser = useAppStore((state) => state.setUser);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const user: IUser = {
            id: session.user.id,
            name: userProfile?.name || '',
            email: session.user.email || '',
            role: userProfile?.role || 'student',
          };

          setUser(user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  return { loading };
}; 