import { useEffect, useState } from "react";
import { getListings } from "./api/listings";
import CreateListingForm from "./components/CreateListingForm";
import ListingCard from "./components/ListingCard";
import ListingDetail from "./components/ListingDetail";
import type { Listing } from "./types";
import Pagination from "./components/Pagination";
import FilterBar from "./components/FilterBar";
import type { ListingFilters } from "./types";

export default function App() {
	const [listings, setListings] = useState<Listing[]>([]);
	const [page, setPage] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [filters, setFilters] = useState<ListingFilters>({});
	const [debouncedFilters, setDebouncedFilters] = useState<ListingFilters>(filters);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		getListings({ page, pageSize, ...debouncedFilters })
			.then((data) => {
				setListings(data.listings);
				setTotalCount(data.totalCount ?? 0);
			})
			.catch((err) =>
				setError(
							err instanceof Error ? err.message : "Failed to load listings",
						),
				)
			.finally(() => setLoading(false));
	}, [page, pageSize, debouncedFilters]);

	// Debounce filter changes to avoid rapid API calls while typing
	useEffect(() => {
		const t = setTimeout(() => setDebouncedFilters(filters), 400);
		return () => clearTimeout(t);
	}, [filters]);

	const selectedListing = listings.find((l) => l.id === selectedId) ?? null;

	const handleBidSuccess = (updated: Listing) => {
		setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
	};

	const handleListingCreated = (listing: Listing) => {
		setListings((prev) => [...prev, listing]);
		setSelectedId(listing.id);
		setShowCreateForm(false);
	};

	return (
		<div className="app">
			<header className="app-header">
				<h1>Interview Auctions</h1>
				<p className="app-header__subtitle">Farm Equipment Marketplace</p>
			</header>
			<div className="app-body">
				<aside className="panel panel--left">
					<div className="panel__heading-row">
						<h2 className="panel__heading">Listings</h2>
						<button
							type="button"
							className="panel__heading-action"
							onClick={() => {
								setShowCreateForm(true);
								setSelectedId(null);
							}}
						>
							+ New
						</button>
					</div>
					{loading && <div className="state-message">Loading listings…</div>}
					{error && (
						<div className="state-message state-message--error">{error}</div>
					)}
					{!loading && !error && (
						<>
							<FilterBar 
								filters={filters} 
								onChange={(f) => {
									setFilters(f);
									setPage(1);
								}} 
								onClear={() => { 
									setFilters({});
									setPage(1);
								}} 
							/>
							<div className="listing-grid">
								{listings.map((listing) => (
									<ListingCard
										key={listing.id}
										listing={listing}
										isSelected={listing.id === selectedId}
										onClick={() => setSelectedId(listing.id)}
									/>
								))}
							</div>

							<Pagination
								page={page}
								pageSize={pageSize}
								onPageChange={(p) => setPage(p)}
								onPageSizeChange={(s) => {
									setPageSize(s);
									setPage(1);
								}}
								totalCount={totalCount}
							/>
						</>
						)}
				</aside>
				<main className="panel panel--right">
					{showCreateForm ? (
						<CreateListingForm onSuccess={handleListingCreated} />
					) : selectedListing ? (
						<ListingDetail
							listing={selectedListing}
							onBidSuccess={handleBidSuccess}
						/>
					) : (
						<div className="empty-state">
							<p>Select a listing to view details and place a bid.</p>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
