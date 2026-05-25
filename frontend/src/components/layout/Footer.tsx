export function Footer() {
  return (
    <footer className="mt-20 bg-[#171913] text-[#f8f1e6]">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <h2 className="font-serif text-xl font-bold">SunDevs Restaurant Ordering</h2>
            <p className="mt-5 max-w-xs text-sm leading-6 text-[#aaa493]">
              Elevating the culinary experience through seasonal integrity, technical precision, and a commitment to the modern epicurean lifestyle.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase text-[#c84a18]">Legal & Ethical</h3>
            <div className="mt-5 space-y-3 text-sm text-[#c9c0ad]">
              <p>Privacy Protocol</p>
              <p>Service Agreement</p>
              <p>Sustainability Index</p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase text-[#c84a18]">Systems Architecture</h3>
            <div className="mt-5 space-y-3 text-sm text-[#c9c0ad]">
              <p>Technical Audit Trail</p>
              <p>API Specification</p>
              <p>Order Pipeline Status</p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase text-[#c84a18]">Ateliers</h3>
            <div className="mt-5 space-y-3 text-sm text-[#c9c0ad]">
              <p>123 Epicurean Way</p>
              <p>Cuisine District, NY 10001</p>
              <p className="font-bold text-white">+1 (212) 555-0198</p>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-7 text-[11px] uppercase text-[#8b8578] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SunDevs Restaurant Ordering. Designed for the discerning.</p>
          <p>Instagram · Journal · Membership</p>
        </div>
      </div>
    </footer>
  )
}
