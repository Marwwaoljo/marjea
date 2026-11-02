ALTER TABLE marjea_institution_feature_flags
  ADD COLUMN IF NOT EXISTS semantic_attempt_limit integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS semantic_attempts_reserved integer NOT NULL DEFAULT 0;

DO $$ BEGIN
  ALTER TABLE marjea_institution_feature_flags
    ADD CONSTRAINT marjea_flag_semantic_attempt_limit_check
    CHECK (semantic_attempt_limit BETWEEN 1 AND 100000);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE marjea_institution_feature_flags
    ADD CONSTRAINT marjea_flag_semantic_attempts_reserved_check
    CHECK (semantic_attempts_reserved >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
