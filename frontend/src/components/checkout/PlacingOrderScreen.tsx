import { ShieldCheck } from 'lucide-react'

export function PlacingOrderScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fbf6ec] px-6 text-center">
      <div className="w-full max-w-xl">
        <img
          src="/images/soup.png"
          alt="Steaming pot"
          className="mx-auto aspect-[16/9] w-full max-w-[520px] rounded-[8px] object-cover shadow-[0_18px_45px_rgba(69,48,27,0.16)]"
        />
        <h1 className="mt-8 font-serif text-4xl font-black leading-tight text-[#17150f] sm:text-5xl">Placing your order...</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#6d5545]">
          Our kitchen is preparing to receive your selections. Please wait while we secure your reservation.
        </p>

        <div className="mx-auto mt-8 h-px max-w-[320px] overflow-hidden bg-[#ddd4c8]">
          <div className="h-full w-16 animate-[loading-bar_1.2s_ease-in-out_infinite] bg-[#b8320a]" />
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-[#b8320a]">
          <ShieldCheck className="h-4 w-4" />
          Secure transaction
        </div>

        <div className="mx-auto mt-8 flex max-w-[360px] items-center justify-center gap-3 rounded-[8px] border border-[#e7c9b7] bg-[#fff9f0] px-5 py-4 text-sm font-medium text-[#6d5545]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#9d7664] text-xs font-black">i</span>
          Duplicate clicks won't create duplicate orders.
        </div>
      </div>
    </div>
  )
}
