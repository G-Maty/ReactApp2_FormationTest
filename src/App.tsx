import { useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { PostList } from './components/PostList';
import { PostDetail } from './components/PostDetail';

export default function App() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h1
              style={{ cursor: selectedPostId ? 'pointer' : 'default' }}
              onClick={() => setSelectedPostId(null)}
            >
              記事一覧
            </h1>
            <div>
              <span style={{ marginRight: 16 }}>{user?.signInDetails?.loginId}</span>
              <button onClick={signOut}>ログアウト</button>
            </div>
          </header>

          {selectedPostId ? (
            <PostDetail postId={selectedPostId} onBack={() => setSelectedPostId(null)} />
          ) : (
            <PostList onSelectPost={setSelectedPostId} />
          )}
        </div>
      )}
    </Authenticator>
  );
}
