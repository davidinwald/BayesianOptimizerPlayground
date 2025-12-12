import { useState, useEffect } from 'react';
import Head from 'next/head';
import Workbench from '../components/Workbench';

export default function Home() {
  return (
    <>
      <Head>
        <title>Bayesian Optimizer Playground</title>
        <meta name="description" content="Interactive Bayesian Optimization playground" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={{ padding: '20px', fontFamily: 'system-ui' }}>
        <h1>Bayesian Optimizer Playground</h1>
        <Workbench />
      </main>
    </>
  );
}
