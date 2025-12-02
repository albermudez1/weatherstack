import Head from "next/head";
import styles from "@/styles/Home.module.css";

/**
 * Main weather report page using Next.js Pages Router.
 * Renders the base layout, a search form to enter a city
 * and a placeholder where the weather information from
 * Weatherstack will be displayed later using React Query.
 */
export default function Home() {
  return (
    <>
      <Head>
        <title>Informe Meteorológico</title>
        <meta
          name="description"
          content="Weatherstack practice project using Next.js and TypeScript"
        />
      </Head>

      <main className={styles.main}>
        <section className={styles.container}>
          <header className={styles.header}>
            <h1>Informe Meteorológico</h1>
            <p>Consulte el clima actual por ciudad.</p>
          </header>

          <section className={styles.searchSection}>
            <form className={styles.form}>
              <label className={styles.label} htmlFor="city">
                Ciudad
              </label>
              <input
                id="city"
                className={styles.input}
                placeholder="Ej: Bogotá, Madrid, Ciudad de México"
              />
              <button type="submit" className={styles.button}>
                Buscar
              </button>
            </form>
          </section>

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
