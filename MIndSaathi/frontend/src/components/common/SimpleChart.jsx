export default function SimpleChart({ data }) {
  return (
    <div className="chart-container">
      {data.map((item, i) => (
        <div key={i} className="chart-row">
          <div className="chart-label">{item.label}</div>
          <div className="chart-bar-container">
            <div 
              className="chart-bar" 
              style={{ width: `${Math.min(item.value, 100)}%`, backgroundColor: item.color || '#2563EB' }}
            >
              <span className="chart-value">{item.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
