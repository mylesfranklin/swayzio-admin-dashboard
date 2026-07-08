-- 0021_instagram_insights_permission_label.sql - Align Instagram insight docs with current Meta permission naming.

COMMENT ON TABLE core.instagram_account_insight IS 'Instagram account-level Insights metric values when instagram_business_manage_insights is granted.';
COMMENT ON TABLE core.instagram_media_insight IS 'Instagram media-level Insights metric values when instagram_business_manage_insights is granted.';

INSERT INTO ops.data_dictionary (schema_name, table_name, column_name, description) VALUES
  ('core','instagram_account_insight','*','Instagram account-level Insights metric values when instagram_business_manage_insights is granted.'),
  ('core','instagram_media_insight','*','Instagram media-level Insights metric values when instagram_business_manage_insights is granted.')
ON CONFLICT (schema_name, table_name, column_name) DO UPDATE
  SET description = EXCLUDED.description, updated_at = now();
