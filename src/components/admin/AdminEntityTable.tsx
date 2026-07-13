import { ReactNode } from 'react';

interface ColumnDef {
  key: string;
  header: string;
}

interface AdminEntityTableProps<T> {
  columns: ColumnDef[];
  rows: {
    id: string;
    photo: string | null;
    photoAlt: string;
    item: T;
  }[];
  loading: boolean;
  emptyMessage: string;
  renderCell: (item: T, columnKey: string) => ReactNode;
  renderMobileCardContent: (item: T) => ReactNode;
  renderDesktopActions: (item: T) => ReactNode;
  renderMobileActions: (item: T) => ReactNode;
  mobileImageAspectRatio?: string;
}

export function AdminEntityTable<T>({
  columns,
  rows,
  loading,
  emptyMessage,
  renderCell,
  renderMobileCardContent,
  renderDesktopActions,
  renderMobileActions,
  mobileImageAspectRatio = 'auto',
}: AdminEntityTableProps<T>) {
  if (loading) {
    return (
      <p className="font-jost font-light text-vd-caption text-sm">Chargement...</p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="font-jost font-light text-vd-caption text-sm">{emptyMessage}</p>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-vd-border">
              {columns.map(col => (
                <th
                  key={col.key}
                  className="text-left font-jost font-light uppercase text-vd-caption text-[10px] tracking-[0.15em] pb-3 pr-6 whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-b border-vd-border">
                {columns.map(col => (
                  <td key={col.key} className="py-4 pr-6">
                    {col.key === 'photo' ? (
                      <div className="w-14 h-14 rounded-sm overflow-hidden bg-vd-surface flex-shrink-0">
                        {row.photo ? (
                          <img
                            src={row.photo}
                            alt={row.photoAlt}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-vd-surface" />
                        )}
                      </div>
                    ) : col.key === 'actions' ? (
                      <div className="flex items-center gap-4 flex-wrap">
                        {renderDesktopActions(row.item)}
                      </div>
                    ) : (
                      renderCell(row.item, col.key)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-4">
        {rows.map(row => (
          <div key={row.id} className="border border-vd-border rounded-sm overflow-hidden">
            <div
              className={`w-full overflow-hidden flex items-center justify-center bg-vd-black ${
                mobileImageAspectRatio !== 'auto' ? 'aspect-[4/3]' : 'h-[200px]'
              }`}
            >
              {row.photo ? (
                <img
                  src={row.photo}
                  alt={row.photoAlt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-vd-black" />
              )}
            </div>

            <div className="px-4 py-3 border-b border-vd-border">
              {renderMobileCardContent(row.item)}
            </div>

            <div className="flex flex-col divide-y divide-vd-border">
              {renderMobileActions(row.item)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
