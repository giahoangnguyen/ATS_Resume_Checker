import ScoreCircle from "./ScoreCircle";

export default function ResultCard({ data }) {
  const score = data?.score ?? 0;
  const level =
    score >= 75 ? "match-high" : score >= 50 ? "match-medium" : "match-low";

  return (
    <article className={`result-card ${level}`}>
      <div className="result-header">
        <h3 className="result-title">Match Result</h3>
        <ScoreCircle score={score} />
      </div>

      <div className="result-body">
        {data?.summary && (
          <section className="result-section">
            <h4>Tóm tắt</h4>
            <p>{data.summary}</p>
          </section>
        )}

        <section className="result-section">
          <h4>Kỹ năng khớp</h4>
          {data?.matched_keywords?.length
            ? data.matched_keywords.map((k) => (
                <span key={k} className="badge">
                  {k}
                </span>
              ))
            : <em>Không có</em>}
        </section>

        <section className="result-section">
          <h4>Kỹ năng thiếu</h4>
          {data?.missing_keywords?.length
            ? data.missing_keywords.map((k) => (
                <span key={k} className="badge">
                  {k}
                </span>
              ))
            : <em>Không có</em>}
        </section>

        {(data?.details?.strengths?.length || data?.details?.gaps?.length) && (
          <section className="result-section">
            <h4>Chi tiết</h4>

            {data?.details?.strengths?.length > 0 && (
              <>
                <h5>Strengths</h5>
                <ul>
                  {data.details.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </>
            )}

            {data?.details?.gaps?.length > 0 && (
              <>
                <h5>Gaps</h5>
                <ul>
                  {data.details.gaps.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}
      </div>
    </article>
  );
}
