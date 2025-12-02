import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useState, type ChangeEvent, type FormEvent } from "react";

/**
 * Main weather report page using Next.js Pages Router.
 * Renders the base layout, a search form to enter a city
 * and a placeholder where the weather information from
 * Weatherstack will be displayed later using React Query.
 */
export default function Home() {

  // City name typed by the user in the search input
  const [city, setCity] = useState<string>("");

  /**
   * Handle changes in the city input.
   * Keeps the React state in sync with the input value.
   */
  const handleCityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCity(event.target.value);
  };

  /**
   * Handle form submission.
   * For now we only prevent the default behavior and log the city.
   * Later we will trigger the Weatherstack API request from here.
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Searching weather for:", city);
  };

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

          {/* Result section - placeholder for future weather data */}
          <section className={styles.resultSection}>
            <div className={styles.placeholderCard}>
              <p>
                +++ la información del clima aparecerá aquí +++
              </p>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
