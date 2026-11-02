-- Additive, opt-in DEVELOPMENT migration. All writers (including direct SQL)
-- participate; no server-start DDL. Hash collisions only over-serialize safely.
CREATE FUNCTION marjea_coverage_lock(key jsonb, shared boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE acquired boolean;
BEGIN
  IF current_setting('transaction_isolation') <> 'read committed' THEN
    RAISE EXCEPTION 'Coverage requires READ COMMITTED and a fresh transaction' USING ERRCODE = '40001';
  END IF;
  IF shared THEN
    acquired := pg_try_advisory_xact_lock_shared(hashtextextended(key::text, 506));
  ELSE
    acquired := pg_try_advisory_xact_lock(hashtextextended(key::text, 506));
  END IF;
  IF NOT acquired THEN
    RAISE EXCEPTION 'Coverage is changing; retry in a new transaction' USING ERRCODE = '55P03';
  END IF;
END $$;

CREATE FUNCTION marjea_coverage_writer() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE row_data jsonb; tenant text; job record;
BEGIN
  -- Protect both sides of moves and deletes. Try-locks never wait and therefore
  -- cannot create advisory/row-lock cycles, even with different row order.
  FOR row_data IN SELECT value FROM jsonb_array_elements(
    CASE TG_OP WHEN 'INSERT' THEN jsonb_build_array(to_jsonb(NEW))
      WHEN 'DELETE' THEN jsonb_build_array(to_jsonb(OLD))
      ELSE jsonb_build_array(to_jsonb(OLD), to_jsonb(NEW)) END)
  LOOP
    tenant := coalesce(row_data->>'tenant_id', row_data->>'institution_id');
    CASE TG_TABLE_NAME
      WHEN 'marjea_official_references' THEN
        PERFORM marjea_coverage_lock(jsonb_build_array('reference', tenant, row_data->>'id'));
      WHEN 'marjea_official_reference_versions' THEN
        PERFORM marjea_coverage_lock(jsonb_build_array('reference', tenant, row_data->>'reference_id'));
      WHEN 'marjea_monitor_sources' THEN
        PERFORM marjea_coverage_lock(jsonb_build_array('source', tenant, row_data->>'id'));
      WHEN 'marjea_observed_content' THEN
        PERFORM marjea_coverage_lock(jsonb_build_array('content', tenant, row_data->>'id'));
      WHEN 'marjea_demo_scenarios' THEN
        PERFORM marjea_coverage_lock(jsonb_build_array('scenario', tenant, row_data->>'id'));
      WHEN 'marjea_review_steps' THEN
        IF row_data->>'semantic_analysis_id' IS NOT NULL THEN
          SELECT * INTO job FROM marjea_semantic_analyses
            WHERE institution_id::text = tenant AND id::text = row_data->>'semantic_analysis_id';
          IF NOT FOUND THEN
            RAISE EXCEPTION 'Review analysis unavailable' USING ERRCODE = '23503';
          END IF;
          PERFORM marjea_coverage_lock(jsonb_build_array('unit', tenant,
            job.official_reference_id::text, job.official_reference_version_number::text, job.dataset_scope));
        END IF;
      ELSE
        -- Links, analyses and claims share a fence even across engine versions.
        -- This also covers inserts for rows that do not yet exist.
        PERFORM marjea_coverage_lock(jsonb_build_array('unit', tenant,
          row_data->>'official_reference_id', row_data->>'official_reference_version_number', row_data->>'dataset_scope'));
    END CASE;
  END LOOP;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;

CREATE FUNCTION marjea_coverage_no_truncate() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Use scoped DELETE; TRUNCATE bypasses coverage fences' USING ERRCODE = '0A000';
END $$;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'marjea_official_references', 'marjea_official_reference_versions',
    'marjea_monitor_sources', 'marjea_observed_content', 'marjea_demo_scenarios',
    'marjea_reference_observations', 'marjea_semantic_analyses',
    'marjea_review_steps', 'marjea_first_observed_deviations']
  LOOP
    EXECUTE format('CREATE TRIGGER marjea_coverage_writer_guard BEFORE INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION marjea_coverage_writer()', table_name);
    EXECUTE format('CREATE TRIGGER marjea_coverage_truncate_guard BEFORE TRUNCATE ON %I FOR EACH STATEMENT EXECUTE FUNCTION marjea_coverage_no_truncate()', table_name);
  END LOOP;
END $$;