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
    prizePool?: string; // Eg: Total: 50,000
    price?: number;
    upiLink?: string;
    qrCodeUrl?: string;
    order: number;
    createdAt?: string;
}
