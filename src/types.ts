export interface Listing {
	id: string;
	title: string;
	description: string;
	category: "tractor" | "combine" | "implement" | "attachment";
	startingPrice: number;
	currentBid: number;
	currentBidder: string | null;
	status: "active" | "closed" | "pending";
	endsAt: string;
	imageUrl: string;
}

export interface ListingFilters {
	category?: Listing["category"];
	status?: Listing["status"];
	startingPriceMin?: number;
	startingPriceMax?: number;
	currentBidMin?: number;
	currentBidMax?: number;
}
