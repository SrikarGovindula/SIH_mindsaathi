export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message">
      <p>{message || 'Something went wrong.'}</p>
      {onRetry && <button onClick={onRetry} className="btn btn-primary">Try Again</button>}
    </div>
  );
}
