import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostList } from './PostList';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  fetchAllPosts: vi.fn(),
}));

describe('PostList', () => {
  const mockOnSelectPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(api.fetchAllPosts).mockResolvedValue([]);
    render(<PostList onSelectPost={mockOnSelectPost} />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('renders posts after loading', async () => {
    vi.mocked(api.fetchAllPosts).mockResolvedValue([
      { postId: '1', title: 'テスト記事', text: '本文です', createdAt: '2026-04-05T10:00:00.000Z', authorSub: 'sub1' },
    ]);
    render(<PostList onSelectPost={mockOnSelectPost} />);
    await waitFor(() => {
      expect(screen.getByText('テスト記事')).toBeInTheDocument();
    });
  });

  it('calls onSelectPost with postId when a post is clicked', async () => {
    vi.mocked(api.fetchAllPosts).mockResolvedValue([
      { postId: 'post-123', title: 'クリック可能な記事', text: '本文', createdAt: '2026-04-05T10:00:00.000Z', authorSub: 'sub1' },
    ]);
    render(<PostList onSelectPost={mockOnSelectPost} />);
    await waitFor(() => screen.getByText('クリック可能な記事'));
    fireEvent.click(screen.getByText('クリック可能な記事'));
    expect(mockOnSelectPost).toHaveBeenCalledWith('post-123');
  });

  it('shows empty message when no posts', async () => {
    vi.mocked(api.fetchAllPosts).mockResolvedValue([]);
    render(<PostList onSelectPost={mockOnSelectPost} />);
    await waitFor(() => {
      expect(screen.getByText('記事がありません')).toBeInTheDocument();
    });
  });

  it('truncates long text to 100 characters', async () => {
    const longText = 'あ'.repeat(150);
    vi.mocked(api.fetchAllPosts).mockResolvedValue([
      { postId: '1', title: 'タイトル', text: longText, createdAt: '2026-04-05T10:00:00.000Z', authorSub: 'sub1' },
    ]);
    render(<PostList onSelectPost={mockOnSelectPost} />);
    await waitFor(() => {
      const displayed = screen.getByText(/あ+…/);
      expect(displayed.textContent?.length).toBeLessThan(110);
    });
  });
});
