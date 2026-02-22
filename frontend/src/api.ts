import axios from "axios";

const API_URL =
  process.env.REACT_APP_FUNCTIONS_URL ||
  "/api/getTourRecommendations";

export interface TourPlace {
  name: string;
  description: string;
  category: string;
  tips: string;
  address?: string;
  lat: number;
  lng: number;
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
    API_URL,
    params
  );
  return response.data;
}
