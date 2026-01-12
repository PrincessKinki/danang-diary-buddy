export interface TripInfo {
  destination: string;
  startDate: string;
  endDate: string;
  accommodation: {
    name: string;
    address: string;
    googleMapsUrl: string;
  };
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  googleMapsUrl: string;
  scheduledDate?: string;
  scheduledTime?: string;
  completed: boolean;
  isFavorite: boolean;
  notes?: string;
  createdAt: string;
}

export type PlaceCategory = 
  | 'food'
  | 'attraction'
  | 'shopping'
  | 'cafe'
  | 'nightlife'
  | 'nature'
  | 'culture'
  | 'other';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  convertedAmount?: number;
}

export type ExpenseCategory = 
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'shopping'
  | 'entertainment'
  | 'other';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  purchased: boolean;
  imageUrl?: string;
  notes?: string;
}

export interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'partly-cloudy';
  humidity: number;
  high: number;
  low: number;
  hourlyForecast: HourlyWeather[];
}

export interface HourlyWeather {
  hour: string;
  temperature: number;
  condition: WeatherData['condition'];
}
