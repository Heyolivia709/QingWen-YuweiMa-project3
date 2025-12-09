import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="panel">
      <h1 className="page-title">Page Not Found</h1>
      <p>The page you were looking for doesn’t exist, has moved, or never existed.</p>
      <p>
        Head back to the <Link to="/">home page</Link> or jump into a <Link to="/games/normal">normal puzzle</Link>!
      </p>
    </div>
  );
}
