import axios from "axios";

const FUNCTIONS_BASE_URL =
  process.env.REACT_APP_FUNCTIONS_URL ||
  "https://us-central1-seoultourmap-12345.cloudfunctions.net";

export interface TourPlace {
  name: string;
  description: string;
  category: string;
  tips: string;
  address?: string;
}

export interface TourRecommendationResponse {
  places: TourPlace[];
  summary: string;
}

export interface TourRecommendationRequest {
  query: string;
  category?: string;
  location?: string;
}

export async function getTourRecommendations(
  params: TourRecommendationRequest
): Promise<TourRecommendationResponse> {
  const response = await axios.post<TourRecommendationResponse>(
    `${FUNCTIONS_BASE_URL}/getTourRecommendations`,
    params
  );
  return response.data;
}
