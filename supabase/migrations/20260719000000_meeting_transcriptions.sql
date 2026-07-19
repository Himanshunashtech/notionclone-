-- Migration: Add notes on Meeting Transcriptions and Document structure
-- This migration documents that no schema alterations were required for the meeting pages,
-- as all dynamic view configurations and transcription/comment states are natively serialized
-- within the `content` field of the `documents` table.

-- Add a comment on the documents table content column to describe serialization format
COMMENT ON COLUMN documents.content IS 'Stores page content, JSON configurations for databases (type=database), database rows (type=database_row), and comments/metadata.';
