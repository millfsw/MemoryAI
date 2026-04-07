import { useMemo } from 'react';

interface SummaryDisplayProps {
  summary: string;
}

function cleanSummaryText(text: string): string {
  // Remove hashtags and bullet markers but KEEP bold markers (**)
  return text
    // Remove hashtags (# followed by space)
    .replace(/#{1,6}\s*/g, '')
    // Remove italic markers (*single* or _single_)
    .replace(/(?<!\*)\*(?!\*)(?!\s)(.*?)(?<!\s)\*(?!\*)/g, '$1')
    .replace(/_(?!\s)(.*?)(?<!\s)_/g, '$1')
    // Remove bullet point markers
    .replace(/^[-*+]\s+/gm, '• ')
    // Remove leading/trailing whitespace
    .trim();
}

function SummaryDisplay({ summary }: SummaryDisplayProps) {
  const cleanedSummary = useMemo(() => cleanSummaryText(summary), [summary]);

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <h2>📝 Study Summary</h2>
      <div className="summary-content" dangerouslySetInnerHTML={{ 
        __html: cleanedSummary
          // Convert **bold** to <strong>
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          // Convert newlines to <br>
          .replace(/\n/g, '<br>')
      }} />
    </div>
  );
}

export default SummaryDisplay;
