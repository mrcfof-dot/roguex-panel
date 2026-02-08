import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#000000] text-white selection:bg-primary/30 overflow-hidden">

      <nav className="animate-slide-down fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/5 bg-black px-6 backdrop-blur-xl md:px-12">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
          <img src="/logo.png" alt="RGX Logo" className="h-14 w-auto" />
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 md:flex absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="group relative text-sm font-medium text-neutral-400 transition-all hover:text-primary">
            Home
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
          </Link>
          <Link href="#" className="group relative text-sm font-medium text-neutral-400 transition-all hover:text-primary">
            Showcase
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
          </Link>
          <Link href="#" className="group relative text-sm font-medium text-neutral-400 transition-all hover:text-primary">
            Features
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
          </Link>
          <Link href="https://discord.gg/MMSVBed3JP" target="_blank" className="group relative text-sm font-medium text-neutral-400 transition-all hover:text-primary">
            Discord
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
          </Link>
        </div>

        <Link
          href="/login"
          className="rounded-xl bg-primary px-6 py-2 text-sm font-bold text-white transition-all hover:scale-105 hover:bg-primary/80 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] active:scale-95"
        >
          Dashboard
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-20 flex flex-1 items-center justify-center">
        <style dangerouslySetInnerHTML={{
          __html: `
          .hero-title {
            font-size: clamp(1rem, 5vw, 1.3rem) !important; /* Smaller size as requested */
            line-height: 1.2 !important;
            text-wrap: balance !important;
            font-weight: 500 !important;
            font-family: var(--font-outfit), sans-serif !important; /* Rounder font */
            width: 100% !important;
            max-width: 90vw !important;
            margin: 0 auto !important;
          }
          .hero-subtitle {
            font-size: clamp(0.7rem, 2.5vw, 0.8rem) !important;
            margin-top: 0.5rem !important;
            font-family: var(--font-inter), sans-serif !important;
            max-width: 80vw !important;
            margin-left: auto !important;
            margin-right: auto !important;
            margin-bottom: 1rem !important;
          }
          @media (min-width: 640px) {
            .hero-title { font-size: clamp(1.5rem, 5vw, 2.5rem) !important; }
            .hero-subtitle { font-size: 1rem !important; }
          }
          @media (min-width: 1024px) {
            .hero-title { 
              font-size: clamp(2.5rem, 4vw, 3.5rem) !important;
              white-space: nowrap !important;
            }
            .hero-subtitle { font-size: 1.1rem !important; }
          }
          }

          .hero-title {
            font-size: clamp(1rem, 5vw, 1.3rem) !important; /* Smaller size as requested */
            line-height: 1.2 !important;
            text-wrap: balance !important;
            font-weight: 500 !important;
            font-family: var(--font-outfit), sans-serif !important; /* Rounder font */
            width: 100% !important;
            max-width: 90vw !important;
            margin: 0 auto !important;
          }
          .hero-subtitle {
            font-size: clamp(0.7rem, 2.5vw, 0.8rem) !important;
            margin-top: 0.5rem !important;
            font-family: var(--font-inter), sans-serif !important;
            max-width: 80vw !important;
            margin-left: auto !important;
            margin-right: auto !important;
            margin-bottom: 1rem !important;
          }
          @media (min-width: 640px) {
            .hero-title { font-size: clamp(1.5rem, 5vw, 2.5rem) !important; }
            .hero-subtitle { font-size: 1rem !important; }
          }
          @media (min-width: 1024px) {
            .hero-title { 
              font-size: clamp(2.5rem, 4vw, 3.5rem) !important;
              white-space: nowrap !important;
            }
            .hero-subtitle { font-size: 1.1rem !important; }
          }
        ` }} />
        <div className="relative flex flex-col items-center text-center">
          <h1 className="hero-title animate-slide-up relative text-white" style={{ animationDelay: '0.2s' }}>
            <span className="text-primary">RGX</span> is not just a store but also a Community
          </h1>
          <p className="hero-subtitle animate-slide-up font-medium text-neutral-500" style={{ animationDelay: '0.4s' }}>
            Still, don't miss your chance to purchase our products
          </p>
          <div className="animate-slide-up mt-8 flex flex-col items-center gap-4" style={{ animationDelay: '0.6s' }}>
            <Link
              href="https://discord.gg/MMSVBed3JP"
              target="_blank"
              className="group flex items-center gap-3 rounded-xl bg-[#5865F2] px-8 py-3 font-bold text-white transition-all hover:scale-105 hover:bg-[#4752c4] hover:shadow-[0_0_25px_rgba(88,101,242,0.4)] active:scale-95"
            >
              <img
                src="/discord.ico"
                alt="Discord Logo"
                className="h-5 w-5 invert transition-transform group-hover:rotate-12"
              />
              Join our Community
            </Link>
          </div>
        </div>
      </main>


      {/* Footer */}
      <footer className="relative z-20 py-8 text-center text-sm text-neutral-700">
        <div className="mb-4 flex justify-center gap-6">
          <Link href="https://discord.gg/MMSVBed3JP" target="_blank" className="hover:text-primary transition-colors">Discord</Link>
          <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
        </div>
        &copy; {new Date().getFullYear()} RGX. All rights reserved.
      </footer>
    </div >
  )
}

