interface SummaryDisplayProps {
  summary: string;
}

function SummaryDisplay({ summary }: SummaryDisplayProps) {
  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <h2>📝 Study Summary</h2>
      <div style={{ 
        whiteSpace: 'pre-wrap', 
        lineHeight: '1.8',
        fontSize: '16px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '4px solid #4a90e2'
      }}>
        {summary}
      </div>
    </div>
  );
}

export default SummaryDisplay;
