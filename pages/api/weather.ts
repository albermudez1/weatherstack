import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Raw Weatherstack location data (picked fields).
 */
type WeatherstackLocation = {
  name: string;
  country: string;
  region: string;
  localtime: string;
};

/**
 * Raw Weatherstack "current" weather data.
 */
type WeatherstackCurrent = {
  temperature?: number;
  temparature?: number; // spelled like this in Weatherstack example
  feelslike: number;
  weather_descriptions?: string[];
  weather_icons?: string[];
  humidity: number;
  wind_speed: number;
};

/**
 * Weatherstack error shape as documented in their API.
 */
type WeatherstackError = {
  code: number;
  type: string;
  info: string;
};

/**
 * Minimal shape of the Weatherstack API response we care about.
 */
type WeatherstackResponse = {
  location?: WeatherstackLocation;
  current?: WeatherstackCurrent;
  error?: WeatherstackError;
};

/**
 * Shape of the cleaned weather data returned to the client.
 */
export type WeatherData = {
  city: string;
  country: string;
  region: string;
  localtime: string;
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
};

/**
 * API response shape for success and error cases.
 */
type WeatherSuccessResponse = {
  success: true;
  data: WeatherData;
};

type WeatherErrorResponse = {
  success: false;
  message: string;
};

export type WeatherApiResponse = WeatherSuccessResponse | WeatherErrorResponse;

/**
 * API Route: /api/weather
 * Receives a "city" query param and returns current weather data
 * using the external Weatherstack "current" endpoint.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WeatherApiResponse>
) {
  const apiKey = process.env.WEATHERSTACK_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: "Weatherstack API key is not configured on the server.",
    });
  }

  const { city } = req.query;

  if (!city || typeof city !== "string") {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid 'city' query parameter.",
    });
  }

  try {
    // Build Weatherstack "current" endpoint URL with API key, city name and metric units
    const url = `https://api.weatherstack.com/current?access_key=${apiKey}&query=${encodeURIComponent(
      city
    )}&units=m`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `Weatherstack request failed with status ${response.status}`,
      });
    }

    // Parse Weatherstack response using a dedicated TypeScript type
    const data: WeatherstackResponse = await response.json();

    // Weatherstack sends an "error" object when something goes wrong
    if (data.error) {
      return res.status(400).json({
        success: false,
        message: data.error.info ?? "Weatherstack API returned an error.",
      });
    }

    if (!data.location || !data.current) {
      return res.status(500).json({
        success: false,
        message: "Weatherstack response is missing required fields.",
      });
    }

    // Handle both "temperature" and the misspelled "temparature" key
    const rawTemperature =
      data.current.temperature ?? data.current.temparature ?? null;

    if (rawTemperature === null) {
      return res.status(500).json({
        success: false,
        message: "Weatherstack response does not contain temperature data.",
      });
    }

    const weather: WeatherData = {
      city: data.location.name,
      country: data.location.country,
      region: data.location.region,
      localtime: data.location.localtime,
      temperature: rawTemperature,
      feelsLike: data.current.feelslike,
      description: data.current.weather_descriptions?.[0] ?? "",
      icon: data.current.weather_icons?.[0] ?? "",
      humidity: data.current.humidity,
      windSpeed: data.current.wind_speed,
    };

    return res.status(200).json({
      success: true,
      data: weather,
    });
  } catch (error) {
    console.error("Error fetching weather:", error);
    return res.status(500).json({
      success: false,
      message: "Unexpected error while fetching weather data.",
    });
  }
}
