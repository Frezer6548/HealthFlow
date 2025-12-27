
import { supabase } from "./supabase";
import { AppState } from "../types";

export const saveUserState = async (uid: string, state: AppState) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: uid, 
        state: state,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) throw error;
  } catch (error: any) {
    console.error("Erro ao salvar no Supabase:", error);
    throw error;
  }
};

export const getUserState = async (uid: string): Promise<AppState | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('state')
      .eq('id', uid)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is code for "no rows returned"
      throw error;
    }
    
    return data?.state as AppState || null;
  } catch (error: any) {
    console.error("Erro ao buscar do Supabase:", error);
    throw error;
  }
};
