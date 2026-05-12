import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/">
            开始查阅文档 - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Luotopia 开源生态系统官方文档站">
      <HomepageHeader />
      <main>
        <div className="container padding-vert--xl">
          <div className="row">
            <div className="col col--6">
              <h3>服务端 (Server)</h3>
              <p>
                基于 Go 语言构建的模块化单体后端。提供 OIDC 身份认证、
                课程评价引擎、全文搜索及各类校园服务代理。
              </p>
              <Link to="/docs/server/">查看后端文档 &raquo;</Link>
            </div>
            <div className="col col--6">
              <h3>客户端 (Client)</h3>
              <p>
                基于 Flutter 开发的跨平台移动端应用。提供极致的 UI/UX 体验，
                完美对接 Luotopia 生态各项功能。
              </p>
              <Link to="/docs/client/">查看客户端文档 &raquo;</Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
