import { Icon } from "./Icon";

export function StatCard({
  label,
  value,
  helper,
  icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  helper?: string;
  icon: string;
  tone?: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon icon-${tone}`}>
        <Icon name={icon} size={22} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {helper && <small>{helper}</small>}
      </div>
    </div>
  );
}
