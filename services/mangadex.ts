import axios from 'axios';
import {
    MangaDexEntity,
    MangaDexListResponse,
    MangaDexSingleResponse,
    MangaDexRelationship,
    MangaItem
} from '@/types/mangadex';

const BASE_URL = 'https://api.mangadex.org';
const COVER_BASE_URL = 'https://uploads.mangadex.org/covers';

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60';

/**
 * Generates full cover art image URL from MangaDex
 */
export const getCoverUrl = (mangaId: string, fileName?: string): string => {
    if (!fileName) return FALLBACK_COVER;
    return `${COVER_BASE_URL}/${mangaId}/${fileName}.256.jpg`;
};

/**
 * Extracts cover filename from relationships array
 */
const extractCoverFileName = (relationships: MangaDexRelationship[]): string | undefined => {
    const coverArt = relationships?.find((rel) => rel.type === 'cover_art');
    return coverArt?.attributes?.fileName;
};

/**
 * Extracts author name from relationships array
 */
const extractAuthorName = (relationships: MangaDexRelationship[]): string | undefined => {
    const author = relationships?.find((rel) => rel.type === 'author' || rel.type === 'artist');
    return author?.attributes?.name;
};

/**
 * Transforms raw MangaDex API entity into simplified MangaItem for UI
 */
export const formatMangaItem = (entity: MangaDexEntity): MangaItem => {
    const { id, attributes, relationships } = entity;

    // Pick title in English, Japanese, or first available language
    const title = attributes.title?.en ||
                  attributes.title?.ja ||
                  attributes.title?.['ja-ro'] ||
                  Object.values(attributes.title || {})[0] ||
                  'Untitled Manga';

    // Pick description in English or first available language
    const description = attributes.description?.en ||
                          Object.values(attributes.description || {})[0] ||
                          'No description available.';

    const coverFileName = extractCoverFileName(relationships);
    const coverUrl = getCoverUrl(id, coverFileName);
    const author = extractAuthorName(relationships);

    // Format tags
    const tags = attributes.tags?.map((t) => t.attributes?.name?.en).filter(Boolean) as string[] || [];

    return {
        id,
        title,
        description,
        coverUrl,
        status: attributes.status || 'unknown',
        year: attributes.year,
        contentRating: attributes.contentRating || 'safe',
        tags,
        author: author || 'Unknown Author',
        ratingScore: 4.5, // Default fallback
    };
};

/**
 * Fetches statistics (ratings & follows count) for a batch of manga items
 */
export const attachStatisticsToMangaList = async (items: MangaItem[]): Promise<MangaItem[]> => {
    if (!items || items.length === 0) return items;

    try {
        const mangaIds = items.map((item) => item.id);
        const response = await axios.get(`${BASE_URL}/statistics/manga`, {
            params: {
                manga: mangaIds,
            },
        });

        const statistics = response.data?.statistics || {};

        return items.map((item) => {
            const stats = statistics[item.id];
            if (stats) {
                // Convert MangaDex 10-point scale average to 5-star rating (e.g. 9.2 / 2 = 4.6)
                const rawAverage = stats.rating?.bayesian || stats.rating?.average || 9.0;
                const ratingScore = parseFloat((rawAverage / 2).toFixed(1));
                const followsCount = stats.follows || 0;

                return {
                    ...item,
                    ratingScore,
                    followsCount,
                };
            }
            return {
                ...item,
                ratingScore: 4.5,
            };
        });
    } catch (error) {
        console.error('Error fetching manga statistics:', error);
        return items.map((item) => ({ ...item, ratingScore: item.ratingScore || 4.5 }));
    }
};

/**
 * Fetches popular manga list from MangaDex API with ratings
 */
export const fetchPopularManga = async (limit = 20, offset = 0): Promise<MangaItem[]> => {
    try {
        const response = await axios.get<MangaDexListResponse>(`${BASE_URL}/manga`, {
            params: {
                limit,
                offset,
                'includes[]': ['cover_art', 'author', 'artist'],
                'order[followedCount]': 'desc',
                'contentRating[]': ['safe', 'suggestive'],
            },
        });

        if (response.data?.data) {
            const items = response.data.data.map(formatMangaItem);
            return await attachStatisticsToMangaList(items);
        }
        return [];
    } catch (error) {
        console.error('Error fetching popular manga from MangaDex:', error);
        return [];
    }
};

/**
 * Fetches latest updated manga from MangaDex API with ratings
 */
export const fetchLatestManga = async (limit = 20, offset = 0): Promise<MangaItem[]> => {
    try {
        const response = await axios.get<MangaDexListResponse>(`${BASE_URL}/manga`, {
            params: {
                limit,
                offset,
                'includes[]': ['cover_art', 'author', 'artist'],
                'order[latestUploadedChapter]': 'desc',
                'contentRating[]': ['safe', 'suggestive'],
            },
        });

        if (response.data?.data) {
            const items = response.data.data.map(formatMangaItem);
            return await attachStatisticsToMangaList(items);
        }
        return [];
    } catch (error) {
        console.error('Error fetching latest manga from MangaDex:', error);
        return [];
    }
};

/**
 * Searches manga by title query from MangaDex API with ratings
 */
export const searchManga = async (title: string, limit = 20, offset = 0): Promise<MangaItem[]> => {
    try {
        const response = await axios.get<MangaDexListResponse>(`${BASE_URL}/manga`, {
            params: {
                title,
                limit,
                offset,
                'includes[]': ['cover_art', 'author', 'artist'],
                'contentRating[]': ['safe', 'suggestive'],
            },
        });

        if (response.data?.data) {
            const items = response.data.data.map(formatMangaItem);
            return await attachStatisticsToMangaList(items);
        }
        return [];
    } catch (error) {
        console.error('Error searching manga from MangaDex:', error);
        return [];
    }
};

/**
 * Fetches a single manga by ID with rating
 */
export const fetchMangaById = async (mangaId: string): Promise<MangaItem | null> => {
    try {
        const response = await axios.get<MangaDexSingleResponse>(`${BASE_URL}/manga/${mangaId}`, {
            params: {
                'includes[]': ['cover_art', 'author', 'artist'],
            },
        });

        if (response.data?.data) {
            const item = formatMangaItem(response.data.data);
            const itemsWithStats = await attachStatisticsToMangaList([item]);
            return itemsWithStats[0];
        }
        return null;
    } catch (error) {
        console.error(`Error fetching manga ${mangaId} from MangaDex:`, error);
        return null;
    }
};
