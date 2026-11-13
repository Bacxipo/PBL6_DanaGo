export interface FeedCategory {
    id: number;
    name: string;
}

export function changeMyPassword(body: { currentPassword: string; newPassword: string; confirmPassword: string }, token: string) {
    return apiRequest<{ message: string }>('/identity/users/me/password', { method: 'PATCH', body, token });
}

export function getFeedCategories(): Promise<FeedCategory[]> {
    return apiRequest<FeedCategory[]>('/destinations/categories');
}

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export type FeedPostType =
    | 'NORMAL'
    | 'QUESTION'
    | 'NEW_DESTINATION';

export interface FeedPost {
    id: number;
    userId: number;
    destinationId: number | null;
    content: string;
    postType: FeedPostType;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    updatedAt: string;
    images: {
        id: number;
        imageUrl: string;
    }[];
    user: {
        id: number;
        username: string;
        fullName: string | null;
        avatarUrl: string | null;
        email: string;
        phoneNumber?: string | null;
        bio?: string | null;
    };
    destination: {
        id: number;
        name: string;
        district: string;
        description: string | null;
        openHours: string | null;
        ticketPrice: string | null;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        category: FeedCategory | null;
    } | null;
    _count: {
        likes: number;
        comments: number;
    };
    isLiked?: boolean;
}

export interface FeedComment {
    id: number;
    postId: number;
    userId: number;
    content: string;
    createdAt: string;
    user: {
        authProvider: 'google' | 'password';
        id: number;
        username: string;
        fullName: string | null;
        avatarUrl: string | null;
    };
}

export interface DestinationProposalInput {
    name: string;
    district: string;
    description?: string;
    categoryId?: number;
    addressUrl?: string;
    ticketPrice?: string;
    openHours?: string;
}

export interface CreateFeedPostInput {
    content: string;
    postType?: FeedPostType;
    destinationId?: number;
    images?: string[];
    proposal?: DestinationProposalInput;
}

interface ApiRequestOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: object | FormData;
    token?: string | null;
}

export async function apiRequest<T>(
    endpoint: string,
    { method = 'GET', body, token }: ApiRequestOptions = {},
): Promise<T> {
    const isFormData =
        typeof FormData !== 'undefined' && body instanceof FormData;

    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            ...(body !== undefined && !isFormData
                ? { 'Content-Type': 'application/json' }
                : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body:
            body === undefined
                ? undefined
                : isFormData
                    ? (body as FormData)
                    : JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message = data?.message;

        throw new Error(
            Array.isArray(message)
                ? message.join(', ')
                : message || `Yêu cầu thất bại (${response.status})`,
        );
    }

    return data as T;
}

export function createFeedPost(
    body: Omit<CreateFeedPostInput, 'images'>,
    files: File[],
    token: string,
): Promise<FeedPost> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(body));
    for (const file of files) {
        formData.append('files', file);
    }
    return apiRequest<FeedPost>('/feed/posts', {
        method: 'POST',
        body: formData,
        token,
    });
}

export function deleteFeedPost(postId: number, token: string) {
    return apiRequest(`/feed/posts/${postId}`, {
        method: 'DELETE',
        token,
    });
}

export function getFeedPosts(
    token?: string | null,
): Promise<FeedPost[]> {
    return apiRequest<FeedPost[]>('/feed/posts', { token });
}

export function getMyFeedPosts(token: string): Promise<FeedPost[]> {
    return apiRequest<FeedPost[]>('/feed/posts/mine', { token });
}

export function getUserFeedPosts(userId: number, token?: string | null): Promise<FeedPost[]> {
    return apiRequest<FeedPost[]>(`/feed/users/${userId}/posts`, { token });
}

export function getPublicProfile(userId: number) {
    return apiRequest<{ id: number; username: string; fullName: string | null; avatarUrl?: string | null; authProvider: 'google' | 'password'; bio?: string | null }>(`/identity/users/${userId}/public`);
}

export interface UserProfile {
    id: number;
    username: string;
    fullName: string | null;
    email: string;
    phoneNumber?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    authProvider: 'google' | 'password';
}

export function updateMyAvatar(file: File, token: string) {
    const body = new FormData();
    body.append('file', file);
    return apiRequest<UserProfile>('/identity/users/me/avatar', { method: 'PATCH', body, token });
}

export function getMyProfile(token: string) {
    return apiRequest<UserProfile>(
        '/identity/users/me',
        { token },
    );
}

export function moderateFeedPost(
    postId: number,
    status: 'APPROVED' | 'REJECTED',
    token: string,
): Promise<FeedPost> {
    return apiRequest<FeedPost>(
        `/feed/posts/${postId}/status`,
        {
            method: 'PATCH',
            body: { status },
            token,
        },
    );
}


export function toggleFeedLike(postId: number, token: string) {
    return apiRequest<{ liked: boolean }>(
        `/feed/posts/${postId}/like`,
        {
            method: 'POST',
            token,
        },
    );
}

export function getFeedComments(postId: number) {
    return apiRequest<FeedComment[]>(
        `/feed/posts/${postId}/comments`,
    );
}

export function createFeedComment(
    postId: number,
    content: string,
    token: string,
) {
    return apiRequest<FeedComment>(
        `/feed/posts/${postId}/comments`,
        {
            method: 'POST',
            body: { content },
            token,
        },
    );
}

export function updateFeedPost(
    postId: number,
    content: string,
    token: string,
): Promise<FeedPost> {
    return apiRequest<FeedPost>(`/feed/posts/${postId}`, {
        method: 'PATCH',
        body: { content },
        token,
    });
}
export async function updateMyProfile(
    body: {
        fullName: string;
        phoneNumber: string;
        bio: string;
        categoryIds?: number[];
    },
    token: string,
) {
    return apiRequest<UserProfile>('/identity/users/me', {
        method: 'PATCH',
        body,
        token,
    });

}
