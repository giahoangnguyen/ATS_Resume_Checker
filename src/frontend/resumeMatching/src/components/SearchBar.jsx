export default function SearchBar({ value, onChange, onClear }) {
    return (
      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <input
            type="search"
            placeholder="Tìm trong kết quả (kỹ năng, từ khóa)..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <button className="btn-clear" onClick={onClear}>
          Clear
        </button>
      </div>
    );
  }
  