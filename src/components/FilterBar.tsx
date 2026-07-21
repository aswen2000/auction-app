import React, { useEffect, useState } from "react";
import type { ListingFilters } from "../types";

interface Props {
    filters: ListingFilters;
    onChange: (f: ListingFilters) => void;
    onClear?: () => void;
}

export default function FilterBar({ filters, onChange, onClear }: Props) {
    const [local, setLocal] = useState<ListingFilters>(filters ?? {});

    useEffect(() => setLocal(filters ?? {}), [filters]);

    // debounce updates
    useEffect(() => {
        const t = setTimeout(() => onChange(local), 500);
        return () => clearTimeout(t);
    }, [local, onChange]);

    return (
        <div className="filter-bar" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <label>
                    Category
                    <select
                        value={local.category ?? ""}
                        onChange={(e) => setLocal(s => ({ ...s, category: e.target.value ? (e.target.value as ListingFilters['category']) : undefined }))}
                        style={{ marginLeft: 6 }}
                    >
                        <option value="">All</option>
                        <option value="tractor">Tractor</option>
                        <option value="combine">Combine</option>
                        <option value="implement">Implement</option>
                        <option value="attachment">Attachment</option>
                    </select>
                </label>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <label>
                    Status
                    <select
                        value={local.status ?? ""}
                        onChange={(e) => setLocal(s => ({ ...s, status: e.target.value ? (e.target.value as ListingFilters['status']) : undefined }))}
                        style={{ marginLeft: 6 }}
                    >
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="pending">Pending</option>
                    </select>
                </label>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <label>
                    Start Price Min
                    <input
                        type="number"
                        value={local.startingPriceMin ?? ""}
                        onChange={(e) => setLocal((s) => ({ ...s, startingPriceMin: e.target.value === "" ? undefined : Number(e.target.value) }))}
                        style={{ marginLeft: 6, width: 120 }}
                    />
                </label>

                <label>
                    Start Price Max
                    <input
                        type="number"
                        value={local.startingPriceMax ?? ""}
                        onChange={(e) => setLocal((s) => ({ ...s, startingPriceMax: e.target.value === "" ? undefined : Number(e.target.value) }))}
                        style={{ marginLeft: 6, width: 120 }}
                    />
                </label>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <label>
                    Current Bid Min
                    <input
                        type="number"
                        value={local.currentBidMin ?? ""}
                        onChange={(e) => setLocal((s) => ({ ...s, currentBidMin: e.target.value === "" ? undefined : Number(e.target.value) }))}
                        style={{ marginLeft: 6, width: 120 }}
                    />
                </label>

                <label>
                    Current Bid Max
                    <input
                        type="number"
                        value={local.currentBidMax ?? ""}
                        onChange={(e) => setLocal((s) => ({ ...s, currentBidMax: e.target.value === "" ? undefined : Number(e.target.value) }))}
                        style={{ marginLeft: 6, width: 120 }}
                    />
                </label>
            </div>

            <div>
                <button type="button" onClick={() => { setLocal({}); onClear?.(); }}>
                    Clear
                </button>
            </div>
        </div>
    );
}
