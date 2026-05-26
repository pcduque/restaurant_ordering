import type { ModifierGroup as ModifierGroupType } from '../../types/menu.types'
import { formatMoney } from '../../utils/money'

interface ModifierGroupProps {
  group: ModifierGroupType
  selectedOptionIds: string[]
  onChange: (optionIds: string[]) => void
}

export function ModifierGroup({ group, selectedOptionIds, onChange }: ModifierGroupProps) {
  const selectedSet = new Set(selectedOptionIds)
  const isSingle = group.maxSelections === 1

  function toggleOption(optionId: string) {
    if (isSingle) {
      if (!group.required && selectedSet.has(optionId)) {
        onChange([])
        return
      }

      onChange([optionId])
      return
    }

    if (selectedSet.has(optionId)) {
      onChange(selectedOptionIds.filter((id) => id !== optionId))
      return
    }

    if (selectedOptionIds.length < group.maxSelections) {
      onChange([...selectedOptionIds, optionId])
    }
  }

  return (
    <section className="rounded-[8px] border border-[#eee6dc] bg-[#fbf8f2] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-black leading-none text-[#17150f]">{group.name}</h3>
          <p className="mt-1 text-[11px] font-bold text-[#a69b8f]">
            {group.required ? 'Required' : 'Optional'} · choose {group.minSelections === group.maxSelections ? group.maxSelections : `up to ${group.maxSelections}`}
          </p>
        </div>
        <span className="rounded-[6px] border border-[#efd8c8] bg-[#fff7ef] px-2.5 py-1 text-[11px] font-black text-[#ff5a00]">
          {selectedOptionIds.length}/{group.maxSelections}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {group.options.map((option) => {
          const checked = selectedSet.has(option.id)
          const disabled = !isSingle && !checked && selectedOptionIds.length >= group.maxSelections

          return (
            <label
              key={option.id}
              className={`flex min-h-12 cursor-pointer items-center justify-between rounded-[6px] border bg-white px-4 py-3 shadow-sm transition ${
                checked ? 'border-[#ff5a00] text-[#17150f]' : disabled ? 'border-[#eee6dc] text-[#b8ada2] opacity-70' : 'border-[#eee6dc] text-[#5f5a54] hover:border-[#efcbb6]'
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  className="h-4 w-4 accent-[#ff5a00]"
                  type={isSingle ? 'radio' : 'checkbox'}
                  name={group.id}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleOption(option.id)}
                />
                <span className="text-sm font-bold">{option.name}</span>
              </span>
              <span className="text-xs font-black text-[#9a8e82]">
                {option.priceCents > 0 ? `+${formatMoney(option.priceCents)}` : 'Included'}
              </span>
            </label>
          )
        })}
      </div>
    </section>
  )
}
