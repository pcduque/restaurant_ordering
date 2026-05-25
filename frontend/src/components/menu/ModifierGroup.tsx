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
    <section className="rounded-[8px] border border-orange-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-950">{group.name}</h3>
          <p className="text-sm text-slate-500">
            {group.required ? 'Required' : 'Optional'} · choose {group.minSelections === group.maxSelections ? group.maxSelections : `up to ${group.maxSelections}`}
          </p>
        </div>
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
          {selectedOptionIds.length}/{group.maxSelections}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {group.options.map((option) => {
          const checked = selectedSet.has(option.id)
          const disabled = !checked && selectedOptionIds.length >= group.maxSelections

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center justify-between rounded-[8px] border px-3 py-3 transition ${
                checked ? 'border-orange-500 bg-orange-50' : disabled ? 'border-slate-100 bg-slate-50 text-slate-400' : 'border-slate-200 hover:border-orange-200'
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  className="h-4 w-4 accent-orange-600"
                  type={isSingle ? 'radio' : 'checkbox'}
                  name={group.id}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleOption(option.id)}
                />
                <span className="text-sm font-semibold">{option.name}</span>
              </span>
              <span className="text-sm font-semibold text-slate-600">
                {option.priceCents > 0 ? `+${formatMoney(option.priceCents)}` : 'Included'}
              </span>
            </label>
          )
        })}
      </div>
    </section>
  )
}
