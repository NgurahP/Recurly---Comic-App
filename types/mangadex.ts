export interface MangaDexTitle {
    [key: string]: string;
}

export interface MangaDexDescription {
    [key: string]: string;
}

export interface MangaDexTagAttributes {
    name: MangaDexTitle;
    description: MangaDexDescription;
    group: string;
    version: number;
}

export interface MangaDexTag {
    id: string;
    type: 'tag';
    attributes: MangaDexTagAttributes;
}

export interface MangaDexRelationship {
    id: string;
    type: string;
    related?: string;
    attributes?: Record<string, any>;
}

export interface MangaDexAttributes {
    title: MangaDexTitle;
    altTitles: MangaDexTitle[];
    description: MangaDexDescription;
    isLocked: boolean;
    originalLanguage: string;
    lastVolume?: string;
    lastChapter?: string;
    status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
    year?: number | null;
    contentRating: 'safe' | 'suggestive' | 'erotica' | 'pornographic';
    tags: MangaDexTag[];
    state: string;
    createdAt: string;
    updatedAt: string;
    version: number;
}

export interface MangaDexEntity {
    id: string;
    type: 'manga';
    attributes: MangaDexAttributes;
    relationships: MangaDexRelationship[];
}

export interface MangaDexListResponse {
    result: 'ok' | 'error';
    response: string;
    data: MangaDexEntity[];
    limit: number;
    offset: number;
    total: number;
}

export interface MangaDexSingleResponse {
    result: 'ok' | 'error';
    response: string;
    data: MangaDexEntity;
}

// Simplified Model for UI Components
export interface MangaItem {
    id: string;
    title: string;
    description: string;
    coverUrl: string;
    status: string;
    year?: number | null;
    contentRating: string;
    tags: string[];
    author?: string;
    ratingScore?: number; // Skor rating (skala 1 - 5, contoh: 4.8)
    followsCount?: number; // Jumlah pengikut / pembaca komik
}
