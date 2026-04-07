import { useMemo } from 'react';

interface SummaryDisplayProps {
  summary: string;
}

function cleanSummaryText(text: string): string {
  return text
    // Remove hashtags (# followed by space)
    .replace(/#{1,6}\s*/g, '')
    // Remove italic markers (*single* or _single_)
    .replace(/(?<!\*)\*(?!\*)(?!\s)(.*?)(?<!\s)\*(?!\*)/g, '$1')
    .replace(/_(?!\s)(.*?)(?<!\s)_/g, '$1')
    // Remove bullet point markers
    .replace(/^[-*+]\s+/gm, '• ')
    // Remove multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace
    .trim();
}

function formatSummaryToHTML(text: string): string {
  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      // Empty line - close any open list
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      continue;
    }

    if (line.startsWith('• ')) {
      // Bullet point
      if (!inList) {
        html += '<ul class="summary-list">\n';
        inList = true;
      }
      const content = line.substring(2)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += `<li>${content}</li>\n`;
    } else if (/^\d+[\.\)]\s/.test(line)) {
      // Numbered list
      if (!inList) {
        html += '<ol class="summary-list">\n';
        inList = true;
      }
      const content = line.replace(/^\d+[\.\)]\s/, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += `<li>${content}</li>\n`;
    } else {
      // Regular text - could be a heading or paragraph
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }

      // Check if it looks like a heading (short line, often capitalized)
      if (line.length < 100 && !line.endsWith('.') && !line.endsWith(',')) {
        html += `<h3 class="summary-heading">${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h3>\n`;
      } else {
        html += `<p class="summary-paragraph">${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>\n`;
      }
    }
  }

  // Close any open list
  if (inList) {
    html += '</ul>\n';
  }

  return html;
}

function SummaryDisplay({ summary }: SummaryDisplayProps) {
  const cleanedSummary = useMemo(() => cleanSummaryText(summary), [summary]);
  const formattedHTML = useMemo(() => formatSummaryToHTML(cleanedSummary), [cleanedSummary]);

  return (
    <div className="card summary-card">
      <h2>📝 Summary</h2>
      <div
        className="summary-content"
        dangerouslySetInnerHTML={{ __html: formattedHTML }}
      />
    </div>
  );
}

export default SummaryDisplay;
