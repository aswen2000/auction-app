interface Props {
    page: number;
    pageSize: number;
    onPageChange: (newPage: number) => void;
    onPageSizeChange: (newSize: number) => void;
    totalCount?: number;
}

export default function Pagination({ page, pageSize, onPageChange, onPageSizeChange, totalCount }: Props) {
    const totalPages = totalCount ? Math.max(1, Math.ceil(totalCount / pageSize)) : undefined;

    return (
        <div
            className="pagination"
            style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                marginTop: 12,
            }}
        >
            <div style={{ flex: 1 }} />

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                >
                    Previous
                </button>

                <div className="pagination__info">
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
            </div>

            <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
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
        </div>
    );
}
