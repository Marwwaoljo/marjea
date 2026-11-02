-- Additive development migration. No record changes, deletes or flag activation.
ALTER TABLE marjea_official_references ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE marjea_observed_content ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE marjea_observed_content ADD COLUMN IF NOT EXISTS manual_classification varchar(40) NOT NULL DEFAULT 'unclassified';
ALTER TABLE marjea_observed_content ADD COLUMN IF NOT EXISTS record_version integer NOT NULL DEFAULT 1;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='marjea_manual_classification_check') THEN
    ALTER TABLE marjea_observed_content ADD CONSTRAINT marjea_manual_classification_check CHECK (manual_classification IN ('unclassified','potential-discrepancy','supportive-circulation'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='marjea_observation_record_version_check') THEN
    ALTER TABLE marjea_observed_content ADD CONSTRAINT marjea_observation_record_version_check CHECK (record_version >= 1);
  END IF;
END $$;