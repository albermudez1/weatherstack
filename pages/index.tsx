import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import type { WeatherApiResponse, WeatherData } from "@/pages/api/weather";

/**
 * Fetch weather data from internal Next.js API route.
 */
const fetchWeather = async (city: string): Promise<WeatherData> => {
  const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data: WeatherApiResponse = await response.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data;
};

/**
 * Main weather report page using Next.js Pages Router.
 * Renders the base layout, a search form to enter a city
 * and a card where the weather information will be displayed
 * using React Query.
 */
export default function Home() {
  // City name typed by the user in the search input
  const [city, setCity] = useState<string>("");

  // City that was actually submitted and used to trigger the query
  const [searchCity, setSearchCity] = useState<string | null>(null);

  /**
   * Handle changes in the city input.
   * Keeps the React state in sync with the input value.
   */
  const handleCityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCity(event.target.value);
  };

  /**
   * Handle form submission.
   * Prevents default behavior and sets the city that will be used
   * to trigger the React Query request.
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = city.trim();
    if (!trimmed) {
      return;
    }

    setSearchCity(trimmed);
  };

  // React Query hook: fetches weather data when searchCity is set
  const {
    data: weather,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["weather", searchCity],
    queryFn: () => fetchWeather(searchCity as string),
    enabled: !!searchCity, // only run when we have a city to search
    retry: 1,
  });

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Unknown error while fetching weather data.";

  return (
    <>
      {/* Document metadata */}
      <Head>
        <title>Informe Meteorológico</title>
        <meta
          name="description"
          content="Weatherstack practice project using Next.js and TypeScript"
        />
      </Head>

      {/* Main layout wrapper */}
      <main className={styles.main}>
        <section className={styles.container}>
          {/* Header section - title and short description */}
          <header className={styles.header}>
            <h1>Informe Meteorológico</h1>
            <p>Consulte el clima actual por ciudad.</p>
          </header>

          {/* Search section - city input and submit button */}
          <section className={styles.searchSection}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.label} htmlFor="city">
                Ciudad
              </label>
              <input
                id="city"
                className={styles.input}
                placeholder="Ej: Bogotá, Madrid, Ciudad de México"
                value={city}
                onChange={handleCityChange}
              />
              <button type="submit" className={styles.button}>
                Buscar
              </button>
            </form>
          </section>

          {/* Result section - shows placeholder, loading, error or weather data */}
          <section className={styles.resultSection}>
            {/* Initial placeholder when no search has been made */}
            {!searchCity && (
              <div className={styles.placeholderCard}>
                <p>Información Meteorológica</p>
              </div>
            )}

            {/* Loading state */}
            {searchCity && (isLoading || isFetching) && (
              <div className={styles.placeholderCard}>
                <p>Cargando información del clima para {searchCity}...</p>
              </div>
            )}

            {/* Error state */}
            {searchCity && isError && (
              <div className={styles.placeholderCard}>
                <div>
                  <p>Ocurrió un error al obtener el clima.</p>
                  <p className={styles.errorText}>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Success state - weather card */}
            {weather && !isLoading && !isError && (
              <article className={styles.weatherCard}>
                <header className={styles.weatherCardHeader}>
                  <div className={styles.weatherLocation}>
                    <h2>{weather.city}</h2>
                    <span>
                      {weather.region}, {weather.country}
                    </span>
                    <span className={styles.weatherTime}>
                      Última actualización: {weather.localtime}
                    </span>
                  </div>

                  <div className={styles.weatherTemperatureGroup}>
                    <p className={styles.weatherTemperature}>
                      {weather.temperature}°C
                    </p>
                    <p className={styles.weatherFeelsLike}>
                      Sensación: {weather.feelsLike}°C
                    </p>
                  </div>
                </header>

                <section className={styles.weatherDetails}>
                  <div className={styles.weatherDetailsItem}>
                    <span>Estado</span>
                    <strong>{weather.description || "Sin descripción"}</strong>
                  </div>

                  <div className={styles.weatherDetailsItem}>
                    <span>Humedad</span>
                    <strong>{weather.humidity}%</strong>
                  </div>

                  <div className={styles.weatherDetailsItem}>
                    <span>Viento</span>
                    <strong>{weather.windSpeed} km/h</strong>
                  </div>

                  {weather.icon && (
                    <div className={styles.weatherDetailsItem}>
                      <span>Icono</span>
                      {/* Using a standard <img> tag for the external weather icon.
                          In the future we could switch to the Next.js <Image> component
                          with a configured remote image domain for better performance. */}
                      <img
                        src={weather.icon}
                        alt={weather.description || "Weather icon"}
                        className={styles.weatherIcon}
                      />
                    </div>
                  )}
                </section>
              </article>
            )}
          </section>
        </section>
      </main>
    </>
  );
}
