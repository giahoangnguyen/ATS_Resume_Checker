export default function ScoreCircle({ score }) {
    const pct = Math.min(Math.max(score ?? 0, 0), 100);
    const style = {
      background: `conic-gradient(var(--primary-color) 0% ${pct}%, #374151 ${pct}% 100%)`,
    };
    return (
      <div className="score-wrapper">
        <div className="score-circle" style={style}>
          {pct}%
        </div>
        <div className="score-label">Overall Score</div>
      </div>
    );
  }
  