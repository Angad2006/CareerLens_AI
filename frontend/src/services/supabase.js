import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Save analysis results to Supabase.
 */
export async function saveAnalysis(userId, filename, industry, analysisData) {
  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: userId,
      filename,
      ats_score: analysisData.ats_score?.overall_score || 0,
      skill_match: analysisData.skills_analysis?.skill_match_percentage || 0,
      industry: industry || 'general',
      analysis_data: analysisData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user's analysis history.
 */
export async function getAnalysisHistory(userId) {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

/**
 * Delete an analysis record.
 */
export async function deleteAnalysis(analysisId, userId) {
  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', analysisId)
    .eq('user_id', userId);

  if (error) throw error;
}
