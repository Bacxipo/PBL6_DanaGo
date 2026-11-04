const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export interface ReviewUser{
        fullName: string | null;
        avatarUrl: string | null;
}
export interface ReviewImage{
    id: number;
    imageUrl: string;
}
export interface Review{
    id: number;
    userId: number;
    destinationId: number;
    rating: number;
    comment: string | null;
    status: 'PENDING' | 'APPROVE' | 'REJECTED';
    createdAt: string;
    user: ReviewUser;
    images: ReviewImage;
    destination?:  {
        id: number;
        name: string;
        district: string;
    }; 
}
export interface CreateReviewPayload{
    destinationId: number;
    rating: number;
    comment?: string;
    images?:string[];
}
export interface UpdateReviewPayload{
    rating?: number;
    comment?: string;
    images?: string[];
}
// lấy ds đã duyệt của 1 đđ
export async function getDestinationReviews(destinationId: number | string): Promise<Review[]>{
    const res = await fetch(`${API_BASE_URL}/community/reviews/destination/${destinationId}`);
    if(!res.ok){
        throw new Error(`Lỗi tải đánh giá:${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data: [];
}
// lấy ds đánh giá của tôi
export async function getMyReviews(token: string): Promise<Review[]>{
    const res = await fetch(`${API_BASE_URL}/community/reviews/my`,{
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if(!res.ok){
        throw Error(`Lỗi tải đánh giá cá nhân: ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}
//upload file ảnh đánh giá 
export async function uploadReviewImage(file: File, token: string): Promise<string>{
    const formData = new FormData();
    formData.append('file',file);

    const res = await fetch(`${API_BASE_URL}/upload/image?folder=review`,{
        method: 'POST',
        headers:{
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });
    if(!res.ok){
        const err = await res.json().catch(()=>({}));
        throw new Error(err.message || `Upload ảnh ${file.name} thất bại`);
    }
    const data = await res.json();
    return data.url;
}
//Tạo bài review mới
export async function createReview(payload: CreateReviewPayload, token: string): Promise<Review> {
    const res = await fetch(`${API_BASE_URL}/community/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Không thể gửi đánh giá.');
    }
    return data;
}
// Chỉnh sửa đánh giá
export async function updateReview(
    reviewId: number,
    payload: UpdateReviewPayload,
    token: string,
    ): Promise<Review> {
    const res = await fetch(`${API_BASE_URL}/community/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Không thể cập nhật đánh giá.');
    }
    return data;
}
//Xóa đánh giá
export async function deleteReview(reviewId: number, token: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/community/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Không thể xóa đánh giá.');
    }
    return data;
}