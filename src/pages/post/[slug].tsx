import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post( { post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>
  }

  const totalWords = post.data.content.reduce((accumulator, contentItem) => {
    accumulator += contentItem.heading.split(' ').length;

    const textWords = contentItem.body.map(item => item.text.split(' ').length);
    textWords.map(word => {
      accumulator += word;
    })

    return accumulator;
  }, 0);

  const wordReadingSpeed = 200;
  const readingTime = Math.ceil(totalWords / wordReadingSpeed);

  return(
    <>
      <Head>
        <title>{`${post.data.title} | Blog from zero`}</title>
      </Head>
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </div>
      <div className={commonStyles.contentContainer}>
        <div className={styles.postHeader}>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.postInfo}>
            <div>
              <FiCalendar /> {
                format(
                  new Date(post.first_publication_date),
                  'dd MMM yyyy',
                  { locale: ptBR }
                )
              }
            </div>
            <div>
              <FiUser /> {post.data.author}
            </div>
            <div>
              <FiClock /> {`${readingTime} min`}
            </div>
          </div>
        </div>
        <div className={styles.postContent}>
          {post.data.content.map(content => {
            return(
              <article key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  className={styles.postText}
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body)}}
                />
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'pos')
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      }
    }
  })

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('pos', String(slug), {});

  const content = response.data.content.map(content => {
    return {
      heading: content.heading,
      body: [...content.body]
    }
  })

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: content,
    }
  }

  return {
    props: { post }
  }
};
