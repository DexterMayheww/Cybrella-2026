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
    price?: number;
    upiLink?: string;
    qrCodeUrl?: string;
    order: number;
    createdAt?: string;
}
