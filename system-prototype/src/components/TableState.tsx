/** 표 아래에 로딩·오류·빈 목록 안내를 보여준다 */
export function TableState({
  loading,
  error,
  empty,
  emptyText,
}: {
  loading: boolean;
  error: string;
  empty: boolean;
  emptyText: string;
}) {
  if (error) return <p className="table-state error">{error}</p>;
  if (loading && empty) return <p className="table-state">불러오는 중…</p>;
  if (empty) return <p className="table-state">{emptyText}</p>;
  return null;
}
