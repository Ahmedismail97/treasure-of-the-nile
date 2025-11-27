import { Link } from 'react-router-dom'
import { Mountain, Landmark } from 'lucide-react'

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-dark to-blue-deep px-3 md:px-4 py-4 md:py-8">
      <div className="text-center max-w-md w-full">
        <div className="mb-4 md:mb-6 animate-float flex justify-center">
          <Mountain className="h-20 w-20 md:h-24 md:w-24 lg:h-32 lg:w-32 text-gold/70" />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-cinzel text-gold mb-3 md:mb-4">404</h1>
        <h2 className="text-xl md:text-2xl font-cinzel text-papyrus mb-3 md:mb-4">
          Lost in the Desert
        </h2>
        <p className="text-papyrus/70 mb-6 md:mb-8 text-sm md:text-base px-2">
          The treasure you seek does not exist in this realm.
          Perhaps the ancient maps have led you astray...
        </p>
        <Link to="/" className="btn btn-gold inline-flex items-center gap-2 min-h-[44px] w-full sm:w-auto justify-center">
          <Landmark className="h-4 w-4" />
          Return to the Temple
        </Link>
      </div>
    </div>
  )
}

export default NotFound
