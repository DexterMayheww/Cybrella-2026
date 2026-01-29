export interface EventData {
    id: string;
    title: string;
    slug: string; // URL-friendly identifier
    category: string;
    date: string;
    posterUrl: string;
    description: string; // Rich text or long description
    rules: string[]; // List of event rules
    gallery: string[]; // Array of gallery image URLs
    // prizePool?: string; // Prize details (e.g., "1st: ₹50,000 | 2nd: ₹30,000 | 3rd: ₹20,000")
    price?: number;
    upiLink?: string;
    qrCodeUrl?: string;
    order: number;
    createdAt?: string;
}
