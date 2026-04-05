import { useState, useEffect } from 'react';
import { fetchAllPosts, type Post } from '../lib/api';

interface PostListProps {
  onSelectPost: (postId: string) => void;
}

export function PostList({ onSelectPost }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAllPosts();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <section>
      {posts.length === 0 ? (
        <p>記事がありません</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {posts.map(post => (
            <li
              key={post.postId}
              onClick={() => onSelectPost(post.postId)}
              style={{
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
                cursor: 'pointer',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>{post.title}</h3>
              <p style={{ margin: '0 0 8px', color: '#555' }}>
                {post.text.length > 100 ? `${post.text.slice(0, 100)}…` : post.text}
              </p>
              <small style={{ color: '#888' }}>{new Date(post.createdAt).toLocaleString('ja-JP')}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
