export interface ICreateReview {
  rating: number;
  comment: string;
  eventId: string;
}

export interface IUpdateReview {
  rating: number;
  comment: string;
  reviewId: string;
}