/** Story text's emphasis (deep review S#8): the authored text marks a few words with `*…*`; on screen they are in
    italics and no asterisk ever shows. A stray, unpaired asterisk is dropped. */
export interface ProsePart { t: string; em: boolean }

export function emphasis(text: string): ProsePart[] {
  const out: ProsePart[] = [], re = /\*([^*]+)\*/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ t: text.slice(last, m.index), em: false });
    out.push({ t: m[1], em: true });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ t: text.slice(last), em: false });
  return out.map(p => ({ t: p.t.replace(/\*/g, ''), em: p.em })).filter(p => p.t);
}

/** The same text with no emphasis marks (for a label read aloud, or a length). */
export const plain = (text: string): string => text.replace(/\*/g, '');
