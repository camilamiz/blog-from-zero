import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home( { postsPagination } : HomeProps ) {
  const formattedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        { locale: ptBR }
      )
    }
  })

  const [posts, setPosts] = useState<Post[]>(formattedPost);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handlePagination (): Promise<void> {
    if (currentPage !== 1 && nextPage === null ) {
      return;
    }

    const postResults = await fetch(`${nextPage}`).then(response => response.json())
    const newPosts = postResults.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          { locale: ptBR }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
      }
    })

    setPosts([...posts, ...newPosts]);
    setCurrentPage(postResults.page);
    setNextPage(postResults.next_page);
  }

  return(
    <>
      <Head>
        <title>Home | Blog from zero</title>
      </Head>
      <main className={commonStyles.contentContainer}>
        <div className={styles.postsList}>
          { posts.map(post => {
            return(
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a>
                  <h1>{post.data.title}</h1>
                  <p>{post.data.subtitle}</p>
                  <div className={commonStyles.postInfo}>
                    <div>
                      <FiCalendar /> {post.first_publication_date}
                    </div>
                    <div>
                      <FiUser /> {post.data.author}
                    </div>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
        { nextPage && (
          <div className={styles.loadMorePosts}>
            <button type="button" onClick={handlePagination}>
              Carregar mais posts
            </button>
          </div>
        )}
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query('',
    {pageSize: 2}
    );

    const posts = postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
      }
    })

    const postsPagination = {
      next_page: postsResponse.next_page,
      results: posts,
    }

  return {
    props: {
      postsPagination
     }
  }
}
