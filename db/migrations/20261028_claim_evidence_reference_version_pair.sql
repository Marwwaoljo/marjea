ALTER TABLE marjea_claim_evidence
  ADD CONSTRAINT marjea_claim_evidence_reference_version_pair_check
  CHECK ((reference_id IS NULL) = (reference_version_number IS NULL));
