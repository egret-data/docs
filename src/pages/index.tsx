import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const cards = [
  {
    title: 'Egret Platform',
    to: '/platform/introduction/overview',
    body: 'Workspaces, BI, Iceberg catalog, governed access, data APIs and workflows on one governed data foundation.',
  },
  {
    title: 'Egret Engine',
    to: '/engine/introduction',
    body: 'A distributed SQL engine for the lakehouse in Rust: DataFusion, Iceberg, PostgreSQL wire protocol.',
  },
];

export default function Home(): ReactNode {
  return (
    <Layout title="Egret documentation" description="Documentation for Egret Platform and Egret Engine">
      <main className={styles.main}>
        <Heading as="h1">Egret documentation</Heading>
        <p>One source of truth for your organization, with isolated workspaces and governed access.</p>
        <div className={styles.cards}>
          {cards.map((c) => (
            <Link key={c.title} to={c.to} className={styles.card}>
              <Heading as="h2">{c.title}</Heading>
              <p>{c.body}</p>
            </Link>
          ))}
        </div>
      </main>
    </Layout>
  );
}
