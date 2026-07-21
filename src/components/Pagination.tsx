interface PaginationProps {
    page: number;
    pageSize: number;
    onPageChange: (newPage: number) => void;
    onPageSizeChange: (newSize: number) => void;
    totalCount?: number;
}

export default function Pagination({ page, pageSize, onPageChange, onPageSizeChange, totalCount }: PaginationProps) {
    const totalPages = totalCount ? Math.max(1, Math.ceil(totalCount / pageSize)) : undefined;

    return (
        <div
            className="pagination"
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 12,
            }}
        >
            <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ flex: 1 }} />

                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                >
                    Previous
                </button>

                <div className="pagination__info" style={{ margin: "0 12px" }}>
                    {totalPages ? (
                        <span>Page {page} of {totalPages}</span>
                    ) : (
                        <span>Page {page}</span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={totalPages !== undefined ? page >= totalPages : false}
                >
                    Next
                </button>

                <div style={{ flex: 1 }} />

                <label>
                    Items:
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            const v = Number(e.target.value);
                            onPageSizeChange(v);
                            onPageChange(1);
                        }}
                        style={{ marginLeft: 6 }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </label>
            </div>

            {totalCount !== undefined && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <span>
                        Total records: {totalCount}
                    </span>
                </div>
            )}
        </div>
    );
}
