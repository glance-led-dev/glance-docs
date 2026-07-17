import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

const HERO = [
  {img: '/img/apps/world-clock/clock.png', w: 192},
  {img: '/img/apps/stocks/price.png', w: 128},
  {img: '/img/apps/local-aqi/now.png', w: 128},
  {img: '/img/apps/sports/score.png', w: 128},
];

const SHOWCASE = [
  {id: 'world-clock', name: 'World Clock', img: '/img/apps/world-clock/clock.png'},
  {id: 'stocks', name: 'Stock Ticker', img: '/img/apps/stocks/price.png'},
  {id: 'local-aqi', name: 'Local AQI', img: '/img/apps/local-aqi/now.png'},
  {id: 'local-fires', name: 'Local Fires', img: '/img/apps/local-fires/status.png'},
  {id: 'sports', name: 'Score', img: '/img/apps/sports/score.png'},
  {id: 'countdown', name: 'Countdown', img: '/img/apps/countdown/days.png'},
  {id: 'message', name: 'Message Sign', img: '/img/apps/message/sign.png'},
  {id: 'quote', name: 'Daily Quote', img: '/img/apps/quote/quote.png'},
  {id: 'ported-weather', name: 'Weather', img: '/img/apps/ported-weather/main.png'},
  {id: 'ported-bigclock', name: 'Big Clock', img: '/img/apps/ported-bigclock/main.png'},
  {id: 'ported-catfact', name: 'Cat Fact', img: '/img/apps/ported-catfact/main.png'},
  {id: 'ported-bibleverse', name: 'Bible Verse', img: '/img/apps/ported-bibleverse/main.png'},
];

const QUICKLINKS = [
  {title: 'Getting started', desc: 'Build your first app in a few minutes.', to: '/docs/getting-started/quickstart'},
  {title: 'Drawing API', desc: 'Every c.* call you use to draw pixels.', to: '/docs/reference/drawing-api'},
  {title: 'Input types', desc: 'The controls users get: dropdowns, dates, color.', to: '/docs/reference/input-types'},
  {title: 'Publish an app', desc: 'Share your app with a pull request.', to: '/docs/publish/submit'},
];

function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <span className={styles.kicker}>GLANCE DEVELOPER NETWORK</span>
        <h1 className={styles.title}>
          Build Apps for your <span className={styles.grn}>GLANCE</span>.
        </h1>
        <p className={styles.sub}>
          Write your own apps, preview them in the Glance Dev Studio environment, then push
          them to our community repo to display on your panel and share with the community.
        </p>
        <div className={styles.ctas}>
          <Link className={styles.btnPrimary} to="/docs/getting-started/quickstart">Get started</Link>
          <Link className={styles.btnGhost} to="/docs/overview/introduction">What is GDN?</Link>
        </div>
        <div className={styles.panelRow}>
          {HERO.map((p) => (
            <div key={p.img} className={styles.panel} style={{maxWidth: p.w * 1.6}}>
              <img src={p.img} alt="" />
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title="Build apps for your GLANCE" description={siteConfig.tagline}>
      <Hero />
      <main className="container margin-vert--xl">
        <div className="cardGrid">
          {QUICKLINKS.map((q) => (
            <Link key={q.title} className="card" to={q.to}>
              <h3>{q.title}</h3>
              <p>{q.desc}</p>
            </Link>
          ))}
        </div>

        <h2 className={styles.h2}>What can you build?</h2>
        <p className={styles.lead}>
          Every one of these is a real GDN app in this repo, clocks, live data, alerts, and fun.
          Each is a folder with a <code>manifest.yaml</code> and an <code>app.star</code>.
        </p>
        <div className="appGrid">
          {SHOWCASE.map((a) => (
            <div key={a.id} className="appTile">
              <img src={a.img} alt={a.name} />
              <div className="name">{a.name}</div>
            </div>
          ))}
        </div>

        <h2 className={styles.h2}>The whole flow</h2>
        <div className="diagram">
          <img src="/img/diagrams/flow.svg" alt="Get the code, open Studio, build it, publish" />
        </div>
        <p className="center margin-top--md">
          <Link className={styles.btnPrimary} to="/docs/getting-started/quickstart">Start the walkthrough</Link>
        </p>
      </main>
    </Layout>
  );
}
