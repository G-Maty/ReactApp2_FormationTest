import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostDetail } from './PostDetail';
import * as api from '../lib/api';

vi.mock('../lib/api', () => ({
  fetchPost: vi.fn(),
}));

describe('PostDetail', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(api.fetchPost).mockResolvedValue({
      postId: '1', title: 'タイトル', text: '本文', createdAt: '2026-04-05T10:00:00.000Z', authorSub: 'sub1'
    });
    render(<PostDetail postId="1" onBack={mockOnBack} />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('renders post content after loading', async () => {
    vi.mocked(api.fetchPost).mockResolvedValue({
      postId: '1', title: '詳細タイトル', text: '詳細本文テキスト', createdAt: '2026-04-05T10:00:00.000Z', authorSub: 'sub1'
    });
    render(<PostDetail postId="1" onBack={mockOnBack} />);
    await waitFor(() => {
      expect(screen.getByText('詳細タイトル')).toBeInTheDocument();
      expect(screen.getByText('詳細本文テキスト')).toBeInTheDocument();
    });
  });

  it('calls onBack when back button is clicked', async () => {
    vi.mocked(api.fetchPost).mockResolvedValue({
      postId: '1', title: 'タイトル', text: '本文', createdAt: '2026-04-05T10:00:00.000Z', authorSub: 'sub1'
    });
    render(<PostDetail postId="1" onBack={mockOnBack} />);
    await waitFor(() => screen.getByText('← 一覧に戻る'));
    fireEvent.click(screen.getByText('← 一覧に戻る'));
    expect(mockOnBack).toHaveBeenCalledOnce();
  });

  it('shows error on fetch failure', async () => {
    vi.mocked(api.fetchPost).mockRejectedValue(new Error('取得エラー'));
    render(<PostDetail postId="1" onBack={mockOnBack} />);
    await waitFor(() => {
      expect(screen.getByText('取得エラー')).toBeInTheDocument();
    });
  });
});
