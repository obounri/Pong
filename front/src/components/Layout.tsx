import Head from 'next/head'

interface layoutProps {
    title: string | undefined,
    description: string | undefined,
    keywords: string | undefined,
    children: JSX.Element | undefined
}

export default function Layout ({title, description, keywords, children}: layoutProps) {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name='keywords' content={keywords}/>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        {children}
      </div>
    </div>
  )
};

Layout.defaultProps = {
    title: 'Pong',
    description: 'Pong game, Play Pong Game, 42',
    keywords: 'pong game arcade game'
};

