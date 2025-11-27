import { Link } from 'react-router-dom'

function AdminPanel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-dark to-blue-deep px-4">
      <div className="max-w-2xl w-full card egyptian-border text-center">
        <div className="text-6xl mb-6">⚙️</div>
        <h1 className="text-3xl font-cinzel text-gold mb-4">Admin Panel</h1>
        <p className="text-papyrus/70 mb-6">
          The admin panel is under construction. For now, you can manage the system using:
        </p>

        <div className="space-y-4 text-left">
          <div className="bg-blue-dark/50 border border-gold/30 rounded-lg p-4">
            <h3 className="text-gold font-semibold mb-2">📊 Database Management</h3>
            <p className="text-papyrus/70 text-sm mb-2">
              Use DB Browser for SQLite to view and edit:
            </p>
            <ul className="text-papyrus/60 text-sm list-disc list-inside space-y-1">
              <li>Teams and their progress</li>
              <li>Stations and challenges</li>
              <li>Pending verifications</li>
              <li>Event settings</li>
            </ul>
            <p className="text-gold/70 text-xs mt-2">
              Open: <code className="bg-blue-dark px-2 py-1 rounded">server/database/treasure_hunt.db</code>
            </p>
          </div>

          <div className="bg-blue-dark/50 border border-gold/30 rounded-lg p-4">
            <h3 className="text-gold font-semibold mb-2">🔧 API Endpoints</h3>
            <p className="text-papyrus/70 text-sm">
              Use tools like Postman or curl to access admin API endpoints at:
            </p>
            <code className="text-gold/70 text-xs block mt-2 bg-blue-dark px-2 py-1 rounded">
              http://localhost:5000/api/v1/admin
            </code>
          </div>

          <div className="bg-blue-dark/50 border border-gold/30 rounded-lg p-4">
            <h3 className="text-gold font-semibold mb-2">📝 Documentation</h3>
            <p className="text-papyrus/70 text-sm">
              See BACKEND_COMPLETE.md for full API documentation and admin operations.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Link to="/" className="btn btn-gold">
            ← Back to Home
          </Link>
        </div>

        <p className="text-papyrus/50 text-xs mt-6">
          Default admin credentials: admin / TreasureNile2024!
        </p>
      </div>
    </div>
  )
}

export default AdminPanel
