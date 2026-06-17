interface StatusBadgeProps {
  status: 'draft' | 'validated' | 'sent'
}

const STATUS_CONFIG = {
  draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
  validated: { label: 'Validée', className: 'bg-blue-100 text-blue-700' },
  sent: { label: 'Envoyée', className: 'bg-green-100 text-green-700' },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
