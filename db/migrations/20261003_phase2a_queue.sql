-- Bounded recovery count, separate from known provider attempt count.
ALTER TABLE marjea_semantic_analyses ADD COLUMN execution_count integer NOT NULL DEFAULT 0;
ALTER TABLE marjea_semantic_analyses ADD CONSTRAINT marjea_analysis_execution_check
  CHECK (execution_count BETWEEN 0 AND 3);