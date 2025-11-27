import { Link } from "react-router-dom";
import { Settings, BarChart3, Wrench, FileText } from "lucide-react";

function AdminPanel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-dark to-blue-deep px-3 md:px-4 py-4 md:py-8">
      <div className="max-w-2xl w-full card egyptian-border text-center">
        <div className="mb-4 md:mb-6 flex justify-center">
          <Settings className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 text-gold" />
        </div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-cinzel text-gold mb-3 md:mb-4">Admin Panel</h1>
        <p className="text-papyrus/70 mb-4 md:mb-6 text-sm md:text-base">
          The admin panel is under construction. For now, you can manage the
          system using:
        </p>

        <div className="space-y-3 md:space-y-4 text-left">
          <div className="bg-blue-dark/50 border border-gold/30 rounded-lg p-3 md:p-4">
            <h3 className="text-gold font-semibold mb-2 text-sm md:text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Database Management
            </h3>
            <p className="text-papyrus/70 text-xs md:text-sm mb-2">
              Use DB Browser for SQLite to view and edit:
            </p>
            <ul className="text-papyrus/60 text-xs md:text-sm list-disc list-inside space-y-1">
              <li>Teams and their progress</li>
              <li>Stations and challenges</li>
              <li>Pending verifications</li>
              <li>Event settings</li>
            </ul>
            <p className="text-gold/70 text-xs mt-2 break-all">
              Open:{" "}
              <code className="bg-blue-dark px-2 py-1 rounded text-xs">
                server/database/treasure_hunt.db
              </code>
            </p>
          </div>

          <div className="bg-blue-dark/50 border border-gold/30 rounded-lg p-3 md:p-4">
            <h3 className="text-gold font-semibold mb-2 text-sm md:text-base flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              API Endpoints
            </h3>
            <p className="text-papyrus/70 text-xs md:text-sm">
              Use tools like Postman or curl to access admin API endpoints at:
            </p>
            <code className="text-gold/70 text-xs block mt-2 bg-blue-dark px-2 py-1 rounded break-all">
              http://localhost:5000/api/v1/admin
            </code>
          </div>

          <div className="bg-blue-dark/50 border border-gold/30 rounded-lg p-3 md:p-4">
            <h3 className="text-gold font-semibold mb-2 text-sm md:text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentation
            </h3>
            <p className="text-papyrus/70 text-xs md:text-sm">
              See BACKEND_COMPLETE.md for full API documentation and admin
              operations.
            </p>
          </div>
        </div>

        <div className="mt-6 md:mt-8">
          <Link to="/" className="btn btn-gold min-h-[44px] w-full sm:w-auto inline-flex justify-center">
            ← Back to Home
          </Link>
        </div>

        <p className="text-papyrus/50 text-xs mt-4 md:mt-6">
          Default admin credentials: admin / TreasureNile2024!
        </p>
      </div>
    </div>
  );
}

export default AdminPanel;
