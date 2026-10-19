import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const products = [
  {
    title: 'Egret Platform',
    to: '/platform/introduction/overview',
    body: 'One governed data foundation for many teams: isolated workspaces, BI and exploration, an Iceberg catalog, access policy, data APIs and workflows.',
    cta: 'Read the platform docs',
  },
  {
    title: 'Egret Engine',
    to: '/engine/introduction',
    body: 'A distributed SQL engine for the lakehouse, written in Rust on DataFusion and Iceberg, speaking the PostgreSQL wire protocol.',
    cta: 'Read the engine docs',
  },
];

const topics = [
  {title: 'Quick start', to: '/platform/quick-start/local', body: 'Run Egret on your machine in minutes.'},
  {title: 'Deployment', to: '/platform/deployment/overview', body: 'Docker Compose and Kubernetes.'},
  {title: 'Guides', to: '/platform/guides', body: 'Workspaces, BI, governance, data APIs, workflows.'},
  {title: 'Administration', to: '/platform/administration', body: 'Identity, roles, engines, audit.'},
  {title: 'Reference', to: '/platform/reference', body: 'Configuration, REST API, permissions.'},
  {title: 'Known issues', to: '/platform/known-issues', body: 'What is rough or missing today.'},
];

export default function Home(): ReactNode {
  return (
    <Layout title="Egret documentation" description="Documentation for Egret Platform and Egret Engine">
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <img className={styles.mark} src={useBaseUrl('/img/logo.svg')} alt="" width={56} height={56} />
          <Heading as="h1" className={styles.title}>
            Egret documentation
          </Heading>
          <p className={styles.lead}>
            One source of truth for your organization, with isolated workspaces and governed access
            on an open Iceberg lakehouse.
          </p>
          <div className={styles.actions}>
            <Link className="button button--primary button--lg" to="/platform/quick-start/local">
              Get started
            </Link>
            <Link className="button button--secondary button--lg" to="/platform/introduction/overview">
              What is Egret?
            </Link>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <section className={styles.products}>
          {products.map((p) => (
            <Link key={p.title} to={p.to} className={styles.product}>
              <Heading as="h2">{p.title}</Heading>
              <p>{p.body}</p>
              <span className={styles.cta}>{p.cta} →</span>
            </Link>
          ))}
        </section>
        <Heading as="h2" className={styles.sectionTitle}>
          Browse by topic
        </Heading>
        <section className={styles.topics}>
          {topics.map((t) => (
            <Link key={t.title} to={t.to} className={styles.topic}>
              <strong>{t.title}</strong>
              <span>{t.body}</span>
            </Link>
          ))}
        </section>
      </main>
    </Layout>
  );
}
