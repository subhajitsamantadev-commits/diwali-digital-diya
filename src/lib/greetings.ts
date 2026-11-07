import { supabase } from './supabase';
import { generateShortId } from './utils';
import type { GreetingInput, Greeting } from './types';

interface GreetingRow {
  short_id: string;
  sender_name: string;
  receiver_name: string;
  language: string;
  tone: string;
  theme: string;
  message: string;
  created_at: string;
}

function rowToGreeting(r: GreetingRow): Greeting {
  return {
    shortId: r.short_id,
    senderName: r.sender_name,
    receiverName: r.receiver_name,
    language: r.language as Greeting['language'],
    tone: r.tone as Greeting['tone'],
    theme: r.theme as Greeting['theme'],
    message: r.message,
    createdAt: r.created_at,
  };
}

export async function saveGreeting(input: GreetingInput): Promise<string> {
  // retry on rare short_id collision
  for (let attempt = 0; attempt < 3; attempt++) {
    const shortId = generateShortId();
    const { error } = await supabase.from('greetings').insert({
      short_id: shortId,
      sender_name: input.senderName,
      receiver_name: input.receiverName,
      language: input.language,
      tone: input.tone,
      theme: input.theme,
      message: input.message,
    });
    if (!error) return shortId;
    if (error.code !== '23505') throw error; // not a unique violation
  }
  throw new Error('Could not generate a unique share link. Please try again.');
}

export async function getGreeting(shortId: string): Promise<Greeting | null> {
  const { data, error } = await supabase
    .from('greetings')
    .select('short_id,sender_name,receiver_name,language,tone,theme,message,created_at')
    .eq('short_id', shortId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToGreeting(data as GreetingRow);
}
