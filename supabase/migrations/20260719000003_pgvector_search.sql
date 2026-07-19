-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Create a function to search documents by similarity
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  p_user_id text
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  user_id TEXT,
  is_archived BOOLEAN,
  parent_document UUID,
  content TEXT,
  cover_image TEXT,
  icon TEXT,
  is_published BOOLEAN,
  "order" INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_favorite BOOLEAN,
  editor_font TEXT,
  full_width BOOLEAN,
  small_text BOOLEAN,
  show_toc BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.user_id,
    d.is_archived,
    d.parent_document,
    d.content,
    d.cover_image,
    d.icon,
    d.is_published,
    d.order,
    d.updated_at,
    d.is_favorite,
    d.editor_font,
    d.full_width,
    d.small_text,
    d.show_toc,
    d.created_at,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE d.user_id = p_user_id
    AND d.is_archived = false
    AND d.embedding IS NOT NULL
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
