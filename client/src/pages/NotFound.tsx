import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-dark to-blue-deep px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6 animate-float">🏜️</div>
        <h1 className="text-6xl font-cinzel text-gold mb-4">404</h1>
        <h2 className="text-2xl font-cinzel text-papyrus mb-4">
          Lost in the Desert
        </h2>
        <p className="text-papyrus/70 mb-8">
          The treasure you seek does not exist in this realm.
          Perhaps the ancient maps have led you astray...
        </p>
        <Link to="/" className="btn btn-gold inline-flex items-center gap-2">
          🏛️ Return to the Temple
        </Link>
      </div>
    </div>
  )
}

export default NotFound
