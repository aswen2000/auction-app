import type { Listing, ListingFilters } from "../types";

export interface ListingsResponse {
	listings: Listing[];
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}

export interface GetListingsOptions extends Partial<ListingFilters> {
	page?: number;
	pageSize?: number;
}

export async function getListings(opts: GetListingsOptions = {}): Promise<ListingsResponse> {
	const { page = 1, pageSize = 10, ...rest } = opts;

	const paramsObj: Record<string, string> = {
		page: String(page),
		pageSize: String(pageSize),
		...Object.fromEntries(
			Object.entries(rest)
				.filter(([, v]) => v !== undefined)
				.map(([k, v]) => [k, String(v)]),
		),
	};

	const res = await fetch(`/api/listings?${new URLSearchParams(paramsObj).toString()}`);
	if (!res.ok) throw new Error("Failed to fetch listings");
	return res.json();
}

export async function getListing(id: string): Promise<Listing> {
	const res = await fetch(`/api/listings/${id}`);
	if (!res.ok) throw new Error("Failed to fetch listing");
	return res.json();
}

export async function createListing(data: { title: string }): Promise<Listing> {
	const res = await fetch("/api/listings", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error || body.detail || "Failed to create listing");
	}
	return res.json();
}

export async function placeBid(
	listingId: string,
	bidder: string,
	amount: number,
): Promise<Listing> {
	const res = await fetch(`/api/listings/${listingId}/bids`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ bidder, amount }),
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.error || data.detail || "Failed to place bid");
	}
	return res.json();
}
