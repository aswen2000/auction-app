import React from "react";
import type { ListingFilters } from "../types";

interface FilterBarProps {
    filters: ListingFilters;
    onChange: (f: ListingFilters) => void;
    onClear?: () => void;
}

export default function FilterBar({ filters, onChange, onClear }: FilterBarProps) {
    const safe = filters ?? {};

    const update = (patch: Partial<ListingFilters>) => {
        onChange({ ...safe, ...patch });
    };

    return (
        <div className="filter-bar" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <label>
                    Category
                    <select
                        value={safe.category ?? ""}
                        onChange={(e) => update({ category: e.target.value ? (e.target.value as ListingFilters['category']) : undefined })}
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
                        value={safe.status ?? ""}
                        onChange={(e) => update({ status: e.target.value ? (e.target.value as ListingFilters['status']) : undefined })}
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
                        value={safe.startingPriceMin ?? ""}
                        onChange={(e) => update({ startingPriceMin: e.target.value === "" ? undefined : Number(e.target.value) })}
                        style={{ marginLeft: 6, width: 120 }}
                    />
                </label>

                <label>
                    Start Price Max
                    <input
                        type="number"
                        value={safe.startingPriceMax ?? ""}
                        onChange={(e) => update({ startingPriceMax: e.target.value === "" ? undefined : Number(e.target.value) })}
                        style={{ marginLeft: 6, width: 120 }}
                    />
                </label>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <label>
                    Current Bid Min
                    <input
                        type="number"
                        value={safe.currentBidMin ?? ""}
                        onChange={(e) => update({ currentBidMin: e.target.value === "" ? undefined : Number(e.target.value) })}
                        style={{ marginLeft: 6, width: 120 }}
                    />
                </label>

                <label>
                    Current Bid Max
                    <input
                        type="number"
                        value={safe.currentBidMax ?? ""}
                        onChange={(e) => update({ currentBidMax: e.target.value === "" ? undefined : Number(e.target.value) })}
                        style={{ marginLeft: 6, width: 120 }}
                    />
                </label>
            </div>

            <div>
                <button type="button" onClick={() => onClear?.()}>
                    Clear
                </button>
            </div>
        </div>
    );
}
