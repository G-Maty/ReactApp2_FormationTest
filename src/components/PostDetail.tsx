import { useState, useEffect } from 'react';
import { fetchPost, type Post } from '../lib/api';

interface PostDetailProps {
  postId: string;
  onBack: () => void;
}

export function PostDetail({ postId, onBack }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPost(postId);
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [postId]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!post) return <p>記事が見つかりません</p>;

  return (
    <article>
      <button onClick={onBack} style={{ marginBottom: 16 }}>← 一覧に戻る</button>
      <h2>{post.title}</h2>
      <small style={{ color: '#888', display: 'block', marginBottom: 16 }}>
        {new Date(post.createdAt).toLocaleString('ja-JP')}
      </small>
      <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{post.text}</p>
    </article>
  );
}
