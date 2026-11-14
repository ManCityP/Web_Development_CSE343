import React, { useState } from 'react';

export default function App() {
  const [comments, setComments] = useState([
    { id: 1, author: 'Hesham', text: 'These are some random comments', likes: 0 },
    { id: 2, author: 'Fris233', text: 'Sleeping...', likes: 0 },
    { id: 3, author: 'Meho', text: 'Mohamed Hany Puskas!!!', likes: 0 },
  ]);

  const [newCommentText, setNewCommentText] = useState('');

  const handlePostComment = (e) => {
    e.preventDefault();
    const trimmedText = newCommentText.trim();
    if (!trimmedText) return;

    const newComment = {
      id: Date.now(),
      author: 'You',
      text: trimmedText,
      likes: 0,
    };

    setComments([...comments, newComment]);
    setNewCommentText('');
  };

  const handleLike = (id) => {
    setComments((prevComments) =>
        prevComments.map((comment) =>
            comment.id === id ? { ...comment, likes: comment.likes + 1 } : comment
        )
    );
  };

  return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '450px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '16px' }}>Comments ({comments.length})</h2>

        <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write a comment..."
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <button
              type="submit"
              style={{ padding: '10px 16px', background: '#0066ff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Post
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comments.map((comment) => (
              <div key={comment.id} style={{ background: '#f1f5f9', padding: '14px', borderRadius: '12px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{comment.author}</div>
                <div style={{ color: '#334155', marginBottom: '8px', fontSize: '14px' }}>{comment.text}</div>
                <button
                    onClick={() => handleLike(comment.id)}
                    style={{ background: 'white', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}
                >
                  ❤️ {comment.likes}
                </button>
              </div>
          ))}
        </div>
      </div>
  );
}