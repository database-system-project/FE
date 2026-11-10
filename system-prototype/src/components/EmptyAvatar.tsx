export function EmptyAvatar({ name, doctor = false }: { name: string; doctor?: boolean }) {
  return <div className={`avatar ${doctor ? "avatar-doctor" : ""}`}>{name.slice(-2)}</div>;
}
