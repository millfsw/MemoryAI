import { useMemo } from 'react';

interface SummaryDisplayProps {
  summary: string;
}

function cleanSummaryText(text: string): string {
  // Remove markdown symbols
  return text
    // Remove hashtags
    .replace(/#{1,6}\s*/g, '')
    // Remove bold/italic markers
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/_/g, '')
    // Remove bullet point markers
    .replace(/^[-*+]\s+/gm, '• ')
    // Remove extra asterisks
    .replace(/\*{2,}/g, '')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace
    .trim();
}

function SummaryDisplay({ summary }: SummaryDisplayProps) {
  const cleanedSummary = useMemo(() => cleanSummaryText(summary), [summary]);

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <h2>📝 Study Summary</h2>
      <div className="summary-content">
        {cleanedSummary}
      </div>
    </div>
  );
}

export default SummaryDisplay;
