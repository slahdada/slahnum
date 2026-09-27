import React from 'react';
import { normalizeText } from '../utils/searchEngine';

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Accurately highlights matched terms in text with accent-insensitivity
 * and case-insensitivity, while strictly keeping the original characters and casing.
 */
export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  query,
  className = '',
  highlightClassName = 'bg-amber-300/40 dark:bg-amber-400/30 text-amber-950 dark:text-amber-100 font-semibold px-0.5 rounded'
}) => {
  if (!text) return null;
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const normalizedQuery = normalizeText(query);
  const terms = normalizedQuery.split(/\s+/).filter(t => t.length > 0);
  if (terms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Decompose text into characters and match normalized positions
  const normalizedText = normalizeText(text);

  // Mark which character indices in normalized text are part of a match
  const matchedIndices = new Set<number>();

  terms.forEach(term => {
    let startIndex = 0;
    while (startIndex < normalizedText.length) {
      const foundPos = normalizedText.indexOf(term, startIndex);
      if (foundPos === -1) break;

      for (let i = foundPos; i < foundPos + term.length; i++) {
        matchedIndices.add(i);
      }
      startIndex = foundPos + 1;
    }
  });

  if (matchedIndices.size === 0) {
    return <span className={className}>{text}</span>;
  }

  // Group contiguous characters into matched or unmatched spans
  // Because normalizedText has length approximately or equal to text,
  // let's map spans directly or build safe character segments
  const segments: { text: string; isMatch: boolean }[] = [];
  let currentSegment = '';
  let currentIsMatch = matchedIndices.has(0);

  for (let i = 0; i < text.length; i++) {
    const isCharMatch = matchedIndices.has(i);
    if (isCharMatch === currentIsMatch) {
      currentSegment += text[i];
    } else {
      if (currentSegment) {
        segments.push({ text: currentSegment, isMatch: currentIsMatch });
      }
      currentSegment = text[i];
      currentIsMatch = isCharMatch;
    }
  }

  if (currentSegment) {
    segments.push({ text: currentSegment, isMatch: currentIsMatch });
  }

  return (
    <span className={className}>
      {segments.map((segment, idx) =>
        segment.isMatch ? (
          <mark key={idx} className={highlightClassName}>
            {segment.text}
          </mark>
        ) : (
          <React.Fragment key={idx}>{segment.text}</React.Fragment>
        )
      )}
    </span>
  );
};
