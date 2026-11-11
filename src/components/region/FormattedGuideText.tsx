import React from 'react';

export interface GuideInlineToken {
  kind: 'text' | 'bold' | 'code';
  value: string;
}

/**
 * Parses lightweight inline guide formatting (`**bold**` and `` `code` ``)
 * into structured tokens without `dangerouslySetInnerHTML`. Any stray unmatched
 * `**` markers are stripped cleanly so raw asterisks never leak into the UI.
 */
export function parseGuideInlineTokens(input: string): GuideInlineToken[] {
  if (!input) {
    return [];
  }

  const tokens: GuideInlineToken[] = [];
  const pattern = /\*\*([^*]+?)\*\*|`([^`]+?)`/g;
  let cursor = 0;
  let match: RegExpExecArray | null = pattern.exec(input);

  const pushPlainText = (raw: string) => {
    const cleaned = raw.replace(/\*\*/g, '');
    if (!cleaned) return;
    const prev = tokens[tokens.length - 1];
    if (prev && prev.kind === 'text') {
      prev.value += cleaned;
    } else {
      tokens.push({ kind: 'text', value: cleaned });
    }
  };

  while (match !== null) {
    if (match.index > cursor) {
      pushPlainText(input.slice(cursor, match.index));
    }

    if (match[1] !== undefined) {
      tokens.push({ kind: 'bold', value: match[1] });
    } else if (match[2] !== undefined) {
      tokens.push({ kind: 'code', value: match[2] });
    }

    cursor = match.index + match[0].length;
    match = pattern.exec(input);
  }

  if (cursor < input.length) {
    pushPlainText(input.slice(cursor));
  }

  return tokens;
}

export interface FormattedGuideTextProps {
  text: string;
  className?: string;
}

export const FormattedGuideText: React.FC<FormattedGuideTextProps> = ({ text, className }) => {
  const tokens = parseGuideInlineTokens(text);

  return (
    <span className={className}>
      {tokens.map((token, idx) => {
        if (token.kind === 'bold') {
          return (
            <strong key={idx} className="guide-inline-strong">
              {token.value}
            </strong>
          );
        }
        if (token.kind === 'code') {
          return (
            <code key={idx} className="guide-inline-code">
              {token.value}
            </code>
          );
        }
        return <React.Fragment key={idx}>{token.value}</React.Fragment>;
      })}
    </span>
  );
};
