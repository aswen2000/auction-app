import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { z } from "zod";

const PORT = 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================================
// Types
// ============================================================

type Category = "tractor" | "combine" | "implement" | "attachment";
type Status = "active" | "closed" | "pending";

interface Listing {
	id: string;
	title: string;
	description: string;
	category: Category;
	startingPrice: number;
	currentBid: number;
	currentBidder: string | null;
	status: Status;
	endsAt: string;
	imageUrl: string;
}

interface BidRequest {
	bidder: string;
	amount: number;
}

interface BidRecord {
	listingId: string;
	bidder: string;
	amount: number;
	placedAt: string;
}

interface CreateListingRequest {
	title: string;
}

// ============================================================
// In-memory store — seeded from data/listings.json
// ============================================================

const listings: Listing[] = JSON.parse(
	readFileSync(join(__dirname, "data", "listings.json"), "utf-8"),
);

const bids: Record<string, BidRecord[]> = {};

// ============================================================
// App
// ============================================================

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// GET /api/listings
app.get("/api/listings", (req: Request, res: Response) => {
	const paginationSchema = z.object({
		page: z.preprocess((val) => (val === undefined ? undefined : Number(val)), z.number().int().positive().default(1)),
		pageSize: z.preprocess((val) => (val === undefined ? undefined : Number(val)), z.number().int().positive().max(100).default(10)),
		category: z.enum(["tractor", "combine", "implement", "attachment"]).optional(),
		status: z.enum(["active", "closed", "pending"]).optional(),
		startingPriceMin: z.preprocess((val) => (val === undefined ? undefined : Number(val)), z.number().nonnegative().optional()),
		startingPriceMax: z.preprocess((val) => (val === undefined ? undefined : Number(val)), z.number().nonnegative().optional()),
		currentBidMin: z.preprocess((val) => (val === undefined ? undefined : Number(val)), z.number().nonnegative().optional()),
		currentBidMax: z.preprocess((val) => (val === undefined ? undefined : Number(val)), z.number().nonnegative().optional()),
	});

	const parsedResult = paginationSchema.safeParse(req.query);
	if (!parsedResult.success) {
		const formattedErrors = z.flattenError(parsedResult.error);
		return res.status(400).json({ error: "Invalid parameters", details: formattedErrors });
	}

	const { page, pageSize, category, status, startingPriceMin, startingPriceMax, currentBidMin, currentBidMax } = parsedResult.data;

	// Apply filters before pagination, would all be SQL queries in a real db
	const filtered = listings.filter((l) => {
		if (category && l.category !== category) return false;
		if (status && l.status !== status) return false;
		if (startingPriceMin !== undefined && l.startingPrice < startingPriceMin) return false;
		if (startingPriceMax !== undefined && l.startingPrice > startingPriceMax) return false;
		if (currentBidMin !== undefined && l.currentBid < currentBidMin) return false;
		if (currentBidMax !== undefined && l.currentBid > currentBidMax) return false;
		return true;
	});

	const totalCount = filtered.length;
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const start = (page - 1) * pageSize;
	const paged = filtered.slice(start, start + pageSize);

	return res.json({
		listings: paged,
		page,
		pageSize,
		totalCount,
		totalPages,
	});
});

// POST /api/listings
app.post("/api/listings", (req: Request, res: Response) => {
	const { title } = req.body as CreateListingRequest;

	if (!title || typeof title !== "string" || title.trim() === "") {
		return res.status(400).json({ error: "Title is required" });
	}

	const listing: Listing = {
		id: randomUUID(),
		title: title.trim(),
		description: "",
		category: "implement",
		startingPrice: 0,
		currentBid: 0,
		currentBidder: null,
		status: "active",
		endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
		imageUrl: "",
	};

	listings.push(listing);
	return res.status(201).json(listing);
});

// GET /api/listings/:id
app.get("/api/listings/:id", (req: Request, res: Response) => {
	const listing = listings.find((l) => l.id === req.params.id);
	if (!listing) {
		return res.status(404).json({ error: "Listing not found" });
	}
	return res.json(listing);
});

// POST /api/listings/:id/bids
app.post("/api/listings/:id/bids", (req: Request, res: Response) => {
	const listing = listings.find((l) => l.id === req.params.id);
	if (!listing) {
		return res.status(404).json({ error: "Listing not found" });
	}

	if (listing.status !== "active") {
		return res
			.status(400)
			.json({ error: "This listing is not currently active" });
	}

	const bid = req.body as BidRequest;

	// TODO: Out of scope for now, but would rather have middleware with Zod
	if (
		!bid.bidder ||
		typeof bid.bidder !== "string" ||
		bid.bidder.trim() === ""
	) {
		return res.status(400).json({ error: "Bidder name is required" });
	}

	if (typeof bid.amount !== "number" || isNaN(bid.amount) || bid.amount <= 0) {
		return res
			.status(400)
			.json({ error: "Bid amount must be a positive number" });
	}

	if (bid.amount <= listing.currentBid) {
		return res.status(400).json({
			error: `Bid must be greater than the current bid of $${listing.currentBid.toLocaleString()}`,
		});
	}

	listing.currentBid = bid.amount;
	listing.currentBidder = bid.bidder.trim();

	bids[listing.id] = bids[listing.id] || [];
	bids[listing.id].push({
		listingId: listing.id,
		bidder: bid.bidder.trim(),
		amount: bid.amount,
		placedAt: new Date().toISOString(),
	});

	return res.status(201).json(listing);
});

// GET /api/listings/:id/bids
app.get("/api/listings/:id/bids", (req: Request, res: Response) => {
	if (!z.uuid().safeParse(req.params.id).success) {
		return res.status(400).json({ error: "Listing ID must be a UUID" });
	}

	if (!listings.find((l) => l.id === req.params.id)) {
		return res.status(404).json({ error: "Listing not found" });
	}

	// Would be SQL query sorted by placedAt DESC in a real db
	const listingBids = (bids[req.params.id] ?? []).sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());

	return res.json(listingBids);
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
