import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import ExitPreviewButton from '../../components/ExitPreviewButton';
import Comments from '../../components/Comments';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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
  preview
}

export default function Post( { post, preview }: PostProps): JSX.Element {
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
          <div className={styles.editInfo}>
            <p>* editado em 19 mar 2021, às 15:49</p>
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
        <div className={styles.extraLine}></div>
        <div className={styles.postsNavigation}>
          <div className={styles.previousPost}>
            <a href="#">
              <p>Como utilizar hooks</p>
              <h4>Post anterior</h4>
            </a>
          </div>
          <div className={styles.nextPost}>
            <a href="#">
              <p>Criando um app CRA do zero</p>
              <h4>Próximo post</h4>
            </a>
          </div>
        </div>
        <Comments />
        <ExitPreviewButton preview={preview} />
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID('pos', String(slug), {
    ref: previewData?.ref ?? null,
  });

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
    props: {
      post,
      preview
    }
  }
};
