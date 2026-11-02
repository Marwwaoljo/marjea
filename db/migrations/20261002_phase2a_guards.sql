-- Database-only guards complement Drizzle's declared constraints.
-- This file is included in the development migration checksum.
CREATE FUNCTION marjea_preserve_analysis_inputs() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF ROW(NEW.institution_id,NEW.official_reference_id,NEW.official_reference_version_number,
         NEW.observed_content_id,NEW.requested_by,NEW.engine_version,NEW.model,
         NEW.schema_version,NEW.prompt_version,NEW.dataset_scope,NEW.input_hash,
         NEW.official_reference_snapshot,NEW.observed_content_snapshot,
         NEW.demo_scenario_id,NEW.demo_generation)
     IS DISTINCT FROM
     ROW(OLD.institution_id,OLD.official_reference_id,OLD.official_reference_version_number,
         OLD.observed_content_id,OLD.requested_by,OLD.engine_version,OLD.model,
         OLD.schema_version,OLD.prompt_version,OLD.dataset_scope,OLD.input_hash,
         OLD.official_reference_snapshot,OLD.observed_content_snapshot,
         OLD.demo_scenario_id,OLD.demo_generation) THEN
    RAISE EXCEPTION 'Analysis inputs are immutable; create a new analysis' USING ERRCODE='23514';
  END IF;
  IF OLD.structured_result IS NOT NULL AND
     ROW(NEW.structured_result,NEW.confidence,NEW.suggested_route,NEW.analyzed_at)
     IS DISTINCT FROM ROW(OLD.structured_result,OLD.confidence,OLD.suggested_route,OLD.analyzed_at) THEN
    RAISE EXCEPTION 'Persisted machine result is immutable' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER marjea_analysis_immutable_guard BEFORE UPDATE ON marjea_semantic_analyses
FOR EACH ROW EXECUTE FUNCTION marjea_preserve_analysis_inputs();

CREATE FUNCTION marjea_preserve_audit_events() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Audit events are append-only' USING ERRCODE='23514';
END $$;
CREATE TRIGGER marjea_audit_append_only BEFORE UPDATE OR DELETE ON marjea_audit_events
FOR EACH ROW EXECUTE FUNCTION marjea_preserve_audit_events();

CREATE FUNCTION marjea_validate_semantic_reviewer() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE requester text; reviewer_role text;
BEGIN
  IF NEW.target_kind = 'semantic_analysis' THEN
    SELECT requested_by INTO requester FROM marjea_semantic_analyses
      WHERE institution_id=NEW.tenant_id AND id=NEW.semantic_analysis_id;
    SELECT role::text INTO reviewer_role FROM marjea_institution_memberships
      WHERE tenant_id=NEW.tenant_id AND clerk_user_id=NEW.reviewer_clerk_user_id;
    IF requester IS NULL OR requester=NEW.reviewer_clerk_user_id OR
       reviewer_role IS NULL OR reviewer_role NOT IN ('tenant_admin','reviewer') THEN
      RAISE EXCEPTION 'Semantic reviewer must be an eligible non-requester' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER marjea_semantic_reviewer_guard BEFORE INSERT OR UPDATE ON marjea_review_steps
FOR EACH ROW EXECUTE FUNCTION marjea_validate_semantic_reviewer();