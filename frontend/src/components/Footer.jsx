import { ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-200 py-6 mt-auto border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-center">
          <span>© 2026 Ancheta Apartment System — </span>
          <a
            href="/ra_9653_2009.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition"
          >
            Know more about Rental Law here
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </footer>
  )
}
