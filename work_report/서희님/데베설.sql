CREATE TABLE `user_account` (
	`account_id`	BIGINT	NOT NULL,
	`login_id`	VARCHAR(50)	NOT NULL,
	`password_hash`	VARCHAR(255)	NOT NULL,
	`role`	VARCHAR(20)	NOT NULL,
	`account_status`	VARCHAR(20)	NOT NULL	DEFAULT 'ACTIVE',
	`password_must_change`	BOOLEAN	NOT NULL	DEFAULT FALSE,
	`account_created_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`account_updated_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `patient` (
	`patient_id`	BIGINT	NOT NULL,
	`account_id`	BIGINT	NOT NULL,
	`patient_name`	VARCHAR(50)	NOT NULL,
	`birth_date`	DATE	NOT NULL,
	`gender`	CHAR(1)	NOT NULL,
	`phone`	VARCHAR(20)	NOT NULL,
	`privacy_agreed_at`	DATETIME	NOT NULL,
	`patient_created_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`patient_updated_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `department` (
	`department_id`	BIGINT	NOT NULL,
	`department_name`	VARCHAR(50)	NOT NULL,
	`location`	VARCHAR(100)	NOT NULL,
	`department_active`	BOOLEAN	NOT NULL	DEFAULT TRUE,
	`department_created_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`department_updated_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `doctor` (
	`doctor_id`	BIGINT	NOT NULL,
	`account_id`	BIGINT	NOT NULL,
	`department_id`	BIGINT	NOT NULL,
	`doctor_name`	VARCHAR(50)	NOT NULL,
	`specialty`	VARCHAR(100)	NOT NULL,
	`doctor_active`	BOOLEAN	NOT NULL	DEFAULT TRUE,
	`doctor_created_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`doctor_updated_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `staff` (
	`staff_id`	BIGINT	NOT NULL,
	`account_id`	BIGINT	NOT NULL,
	`staff_name`	VARCHAR(50)	NOT NULL,
	`staff_active`	BOOLEAN	NOT NULL	DEFAULT TRUE,
	`staff_created_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`staff_updated_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `doctor_schedule` (
	`schedule_id`	BIGINT	NOT NULL,
	`doctor_id`	BIGINT	NOT NULL,
	`schedule_date`	DATE	NOT NULL,
	`reception_start_time`	TIME	NOT NULL,
	`reception_end_time`	TIME	NOT NULL,
	`lunch_start_time`	TIME	NULL,
	`lunch_end_time`	TIME	NULL,
	`schedule_active`	BOOLEAN	NOT NULL	DEFAULT TRUE,
	`created_by_staff_id`	BIGINT	NOT NULL,
	`updated_by_staff_id`	BIGINT	NULL,
	`schedule_created_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`schedule_updated_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `reservation` (
	`reservation_id`	BIGINT	NOT NULL,
	`patient_id`	BIGINT	NOT NULL,
	`schedule_id`	BIGINT	NOT NULL,
	`previous_reservation_id`	BIGINT	NULL,
	`planned_reception_at`	DATETIME	NOT NULL,
	`reservation_status`	VARCHAR(20)	NOT NULL	DEFAULT 'RESERVED',
	`reserved_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`patient_cancelled_at`	DATETIME	NULL,
	`cancellation_reason`	VARCHAR(500)	NULL,
	`active_planned_reception_at`	DATETIME	NULL
);

CREATE TABLE `visit` (
	`visit_id`	BIGINT	NOT NULL,
	`reservation_id`	BIGINT	NOT NULL,
	`checked_in_at`	DATETIME	NOT NULL,
	`checked_in_by_staff_id`	BIGINT	NOT NULL,
	`visit_status`	VARCHAR(20)	NOT NULL	DEFAULT 'WAITING',
	`started_at`	DATETIME	NULL,
	`completed_at`	DATETIME	NULL,
	`visit_created_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`visit_updated_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `medical_record` (
	`record_id`	BIGINT	NOT NULL,
	`visit_id`	BIGINT	NOT NULL,
	`symptoms`	TEXT	NOT NULL,
	`diagnosis`	TEXT	NOT NULL,
	`treatment_note`	TEXT	NOT NULL,
	`written_by_doctor_id`	BIGINT	NOT NULL,
	`written_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`updated_by_doctor_id`	BIGINT	NULL,
	`record_updated_at`	DATETIME	NULL
);

CREATE TABLE `consultation_fee` (
	`consultation_fee_id`	BIGINT	NOT NULL,
	`fee_amount`	INT	NOT NULL,
	`effective_from`	DATETIME	NOT NULL,
	`effective_to`	DATETIME	NULL,
	`set_by_staff_id`	BIGINT	NOT NULL,
	`fee_created_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `payment` (
	`payment_id`	BIGINT	NOT NULL,
	`visit_id`	BIGINT	NOT NULL,
	`consultation_fee_id`	BIGINT	NOT NULL,
	`paid_amount`	INT	NOT NULL,
	`paid_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`processed_by_staff_id`	BIGINT	NOT NULL
);

CREATE TABLE `medicine` (
	`medicine_id`	BIGINT	NOT NULL,
	`item_seq`	VARCHAR(20)	NOT NULL,
	`product_name`	VARCHAR(200)	NOT NULL,
	`company_name`	VARCHAR(100)	NOT NULL,
	`professional_type`	VARCHAR(20)	NULL,
	`dosage_form`	VARCHAR(100)	NULL,
	`standard_code`	VARCHAR(30)	NULL,
	`atc_code`	VARCHAR(20)	NULL,
	`medicine_active`	BOOLEAN	NOT NULL	DEFAULT TRUE,
	`source_updated_at`	DATETIME	NULL,
	`medicine_created_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`medicine_updated_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `ingredient` (
	`ingredient_id`	BIGINT	NOT NULL,
	`ingredient_code`	VARCHAR(30)	NULL,
	`ingredient_name_ko`	VARCHAR(200)	NOT NULL,
	`ingredient_name_en`	VARCHAR(200)	NULL
);

CREATE TABLE `medicine_ingredient` (
	`medicine_id`	BIGINT	NOT NULL,
	`ingredient_id`	BIGINT	NOT NULL,
	`ingredient_amount`	DECIMAL(12, 4)	NULL,
	`amount_unit`	VARCHAR(30)	NULL,
	`is_main_ingredient`	BOOLEAN	NOT NULL	DEFAULT TRUE
);

CREATE TABLE `medicine_overview` (
	`medicine_id`	BIGINT	NOT NULL,
	`efficacy`	TEXT	NULL,
	`use_method`	TEXT	NULL,
	`warning`	TEXT	NULL,
	`precautions`	TEXT	NULL,
	`interactions`	TEXT	NULL,
	`side_effects`	TEXT	NULL,
	`storage_method`	TEXT	NULL,
	`item_image_url`	VARCHAR(1000)	NULL,
	`source_open_date`	DATE	NULL,
	`source_update_date`	DATE	NULL,
	`synced_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `dur_rule` (
	`dur_rule_id`	BIGINT	NOT NULL,
	`source_rule_seq`	VARCHAR(50)	NOT NULL,
	`rule_type`	VARCHAR(30)	NOT NULL,
	`rule_name`	VARCHAR(200)	NULL,
	`rule_content`	TEXT	NOT NULL,
	`detail_content`	TEXT	NULL,
	`age_operator`	VARCHAR(10)	NULL,
	`age_limit`	SMALLINT	NULL,
	`pregnancy_grade`	VARCHAR(20)	NULL,
	`max_daily_dose`	DECIMAL(12, 4)	NULL,
	`dose_unit`	VARCHAR(30)	NULL,
	`max_duration_days`	SMALLINT	NULL,
	`effective_from`	DATE	NULL,
	`effective_to`	DATE	NULL,
	`source_updated_at`	DATETIME	NULL,
	`dur_rule_active`	BOOLEAN	NOT NULL	DEFAULT TRUE
);

CREATE TABLE `dur_rule_target` (
	`target_seq`	SMALLINT	NOT NULL,
	`dur_rule_id`	BIGINT	NOT NULL,
	`medicine_id`	BIGINT	NULL,
	`ingredient_id`	BIGINT	NULL,
	`target_role`	VARCHAR(20)	NOT NULL	DEFAULT 'TARGET',
	`target_name_snapshot`	VARCHAR(200)	NULL
);

CREATE TABLE `prescription` (
	`prescription_id`	BIGINT	NOT NULL,
	`visit_id`	BIGINT	NOT NULL,
	`prescribed_by_doctor_id`	BIGINT	NOT NULL,
	`prescribed_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`prescription_status`	VARCHAR(20)	NOT NULL	DEFAULT 'DRAFT',
	`cancelled_at`	DATETIME	NULL,
	`cancelled_by_doctor_id`	BIGINT	NULL,
	`cancellation_reason`	VARCHAR(500)	NULL
);

CREATE TABLE `prescription_item` (
	`prescription_item_id`	BIGINT	NOT NULL,
	`prescription_id`	BIGINT	NOT NULL,
	`line_no`	SMALLINT	NOT NULL,
	`medicine_id`	BIGINT	NOT NULL,
	`dose_amount`	DECIMAL(10, 2)	NOT NULL,
	`dose_unit`	VARCHAR(20)	NOT NULL,
	`times_per_day`	SMALLINT	NOT NULL,
	`interval_days`	SMALLINT	NOT NULL	DEFAULT 1,
	`total_days`	SMALLINT	NOT NULL,
	`timing`	VARCHAR(50)	NULL,
	`directions`	VARCHAR(500)	NULL
);

CREATE TABLE `prescription_dur_alert` (
	`dur_alert_id`	BIGINT	NOT NULL,
	`related_item_id`	BIGINT	NOT NULL,
	`prescription_id`	BIGINT	NOT NULL,
	`primary_item_id`	BIGINT	NOT NULL,
	`dur_rule_id`	BIGINT	NOT NULL,
	`alert_message`	TEXT	NOT NULL,
	`alert_status`	VARCHAR(20)	NOT NULL	DEFAULT 'OPEN',
	`detected_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP,
	`resolved_at`	DATETIME	NULL
);

CREATE TABLE `contraindication_override` (
	`override_id`	BIGINT	NOT NULL,
	`dur_alert_id`	BIGINT	NOT NULL,
	`override_reason`	TEXT	NOT NULL,
	`recorded_by_doctor_id`	BIGINT	NOT NULL,
	`recorded_at`	DATETIME	NOT NULL	DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE `user_account` ADD CONSTRAINT `PK_USER_ACCOUNT` PRIMARY KEY (
	`account_id`
);

ALTER TABLE `patient` ADD CONSTRAINT `PK_PATIENT` PRIMARY KEY (
	`patient_id`
);

ALTER TABLE `department` ADD CONSTRAINT `PK_DEPARTMENT` PRIMARY KEY (
	`department_id`
);

ALTER TABLE `doctor` ADD CONSTRAINT `PK_DOCTOR` PRIMARY KEY (
	`doctor_id`
);

ALTER TABLE `staff` ADD CONSTRAINT `PK_STAFF` PRIMARY KEY (
	`staff_id`
);

ALTER TABLE `doctor_schedule` ADD CONSTRAINT `PK_DOCTOR_SCHEDULE` PRIMARY KEY (
	`schedule_id`
);

ALTER TABLE `reservation` ADD CONSTRAINT `PK_RESERVATION` PRIMARY KEY (
	`reservation_id`
);

ALTER TABLE `visit` ADD CONSTRAINT `PK_VISIT` PRIMARY KEY (
	`visit_id`
);

ALTER TABLE `medical_record` ADD CONSTRAINT `PK_MEDICAL_RECORD` PRIMARY KEY (
	`record_id`
);

ALTER TABLE `consultation_fee` ADD CONSTRAINT `PK_CONSULTATION_FEE` PRIMARY KEY (
	`consultation_fee_id`
);

ALTER TABLE `payment` ADD CONSTRAINT `PK_PAYMENT` PRIMARY KEY (
	`payment_id`
);

ALTER TABLE `medicine` ADD CONSTRAINT `PK_MEDICINE` PRIMARY KEY (
	`medicine_id`
);

ALTER TABLE `ingredient` ADD CONSTRAINT `PK_INGREDIENT` PRIMARY KEY (
	`ingredient_id`
);

ALTER TABLE `medicine_ingredient` ADD CONSTRAINT `PK_MEDICINE_INGREDIENT` PRIMARY KEY (
	`medicine_id`,
	`ingredient_id`
);

ALTER TABLE `medicine_overview` ADD CONSTRAINT `PK_MEDICINE_OVERVIEW` PRIMARY KEY (
	`medicine_id`
);

ALTER TABLE `dur_rule` ADD CONSTRAINT `PK_DUR_RULE` PRIMARY KEY (
	`dur_rule_id`
);

ALTER TABLE `dur_rule_target` ADD CONSTRAINT `PK_DUR_RULE_TARGET` PRIMARY KEY (
	`target_seq`,
	`dur_rule_id`
);

ALTER TABLE `prescription` ADD CONSTRAINT `PK_PRESCRIPTION` PRIMARY KEY (
	`prescription_id`
);

ALTER TABLE `prescription_item` ADD CONSTRAINT `PK_PRESCRIPTION_ITEM` PRIMARY KEY (
	`prescription_item_id`
);

ALTER TABLE `prescription_dur_alert` ADD CONSTRAINT `PK_PRESCRIPTION_DUR_ALERT` PRIMARY KEY (
	`dur_alert_id`,
	`related_item_id`
);

ALTER TABLE `contraindication_override` ADD CONSTRAINT `PK_CONTRAINDICATION_OVERRIDE` PRIMARY KEY (
	`override_id`
);

ALTER TABLE `medicine_ingredient` ADD CONSTRAINT `FK_medicine_TO_medicine_ingredient_1` FOREIGN KEY (
	`medicine_id`
)
REFERENCES `medicine` (
	`medicine_id`
);

ALTER TABLE `medicine_ingredient` ADD CONSTRAINT `FK_ingredient_TO_medicine_ingredient_1` FOREIGN KEY (
	`ingredient_id`
)
REFERENCES `ingredient` (
	`ingredient_id`
);

ALTER TABLE `medicine_overview` ADD CONSTRAINT `FK_medicine_TO_medicine_overview_1` FOREIGN KEY (
	`medicine_id`
)
REFERENCES `medicine` (
	`medicine_id`
);

ALTER TABLE `dur_rule_target` ADD CONSTRAINT `FK_dur_rule_TO_dur_rule_target_1` FOREIGN KEY (
	`dur_rule_id`
)
REFERENCES `dur_rule` (
	`dur_rule_id`
);

ALTER TABLE `prescription_dur_alert` ADD CONSTRAINT `FK_prescription_item_TO_prescription_dur_alert_1` FOREIGN KEY (
	`related_item_id`
)
REFERENCES `prescription_item` (
	`prescription_item_id`
);

