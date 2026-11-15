-- 로컬 테스트용 시드 데이터 (프론트 연동 확인용)
-- ※ 실제 시연용 시드(공공데이터 약품·금기 등)는 백엔드 담당이 따로 만든다. 이 파일은 각자 로컬 DB에서만 쓴다.
-- 비밀번호: 전부 Test1234!
-- 실행 (BE 폴더에서, docker compose up 한 뒤):
--   docker compose exec -T postgres psql -U hospital -d hospital < (FE 레포 경로)/system-prototype/dev/local-test-seed.sql
-- 다시 넣고 싶으면 DB를 비운 뒤 실행 (이미 있는 아이디는 건너뜀)

BEGIN;

INSERT INTO user_account(login_id, password_hash, role) VALUES ('admin01', '897295bed1da42b188c50998e74cde997a73581c7f406014778e17393bb4b37d5e7955ff3b616d458ba987947fa061b5', 'ADMIN') ON CONFLICT (login_id) DO NOTHING;
INSERT INTO user_account(login_id, password_hash, role) VALUES ('desk01', 'eacc4fe8351657e4970a1c7ad40ff86edccc3fc58f583d1a9fac46241faad731a7f7accea2232df76d4acfcd0e1d0d98', 'RECEPTION') ON CONFLICT (login_id) DO NOTHING;
INSERT INTO user_account(login_id, password_hash, role) VALUES ('cashier01', 'd5dea254962ed018b7f58953f79233f7c4fc76555878b316200e968118d039b1a87adb18cab4c3d64d9128cab56c3f07', 'CASHIER') ON CONFLICT (login_id) DO NOTHING;
INSERT INTO user_account(login_id, password_hash, role) VALUES ('doctor01', 'd859f74df07d4cfd96d367869a3fd6fc67c00f7d86e86a3dae2a3808a81b7b28a4e9f0380e39d76662adf87e476a1e65', 'DOCTOR') ON CONFLICT (login_id) DO NOTHING;
INSERT INTO user_account(login_id, password_hash, role) VALUES ('doctor02', 'b5d3e642039911b05b04af3bcff3caae67505ad7c8c25cf9343b95c20638566064c2a246e004817b9def2edda3134ae7', 'DOCTOR') ON CONFLICT (login_id) DO NOTHING;
INSERT INTO user_account(login_id, password_hash, role) VALUES ('patient01', 'b104ce9653008351e2a3f30a2365348d127513841ef7e94ee67ec4e022d33743c5901e74fd60a080e26b3d2fd2842f9a', 'PATIENT') ON CONFLICT (login_id) DO NOTHING;

-- 직원 프로필 (백엔드 규칙상 의사 계정도 staff 행이 있어야 예약·진료 API가 동작함)
INSERT INTO staff(account_id, staff_name) SELECT account_id, '관리자' FROM user_account a WHERE login_id = 'admin01' AND NOT EXISTS (SELECT 1 FROM staff s WHERE s.account_id = a.account_id);
INSERT INTO staff(account_id, staff_name) SELECT account_id, '원무 직원' FROM user_account a WHERE login_id = 'desk01' AND NOT EXISTS (SELECT 1 FROM staff s WHERE s.account_id = a.account_id);
INSERT INTO staff(account_id, staff_name) SELECT account_id, '수납 담당자' FROM user_account a WHERE login_id = 'cashier01' AND NOT EXISTS (SELECT 1 FROM staff s WHERE s.account_id = a.account_id);
INSERT INTO staff(account_id, staff_name) SELECT account_id, '이정훈' FROM user_account a WHERE login_id = 'doctor01' AND NOT EXISTS (SELECT 1 FROM staff s WHERE s.account_id = a.account_id);
INSERT INTO staff(account_id, staff_name) SELECT account_id, '김민서' FROM user_account a WHERE login_id = 'doctor02' AND NOT EXISTS (SELECT 1 FROM staff s WHERE s.account_id = a.account_id);

-- 진료과
INSERT INTO department(department_name) SELECT '내과' WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_name = '내과');
INSERT INTO department(department_name) SELECT '피부과' WHERE NOT EXISTS (SELECT 1 FROM department WHERE department_name = '피부과');

-- 의사
INSERT INTO doctor(account_id, department_id, doctor_name)
SELECT a.account_id, d.department_id, '이정훈' FROM user_account a, department d
 WHERE a.login_id = 'doctor01' AND d.department_name = '내과' AND NOT EXISTS (SELECT 1 FROM doctor x WHERE x.account_id = a.account_id);
INSERT INTO doctor(account_id, department_id, doctor_name)
SELECT a.account_id, d.department_id, '김민서' FROM user_account a, department d
 WHERE a.login_id = 'doctor02' AND d.department_name = '피부과' AND NOT EXISTS (SELECT 1 FROM doctor x WHERE x.account_id = a.account_id);

-- 의사 일정: 오늘부터 14일, 일요일 제외 (시간은 병원 공통 기본값)
INSERT INTO doctor_schedule(doctor_id, schedule_date)
SELECT doc.doctor_id, day::date
  FROM doctor doc
 CROSS JOIN generate_series((now() AT TIME ZONE 'Asia/Seoul')::date, (now() AT TIME ZONE 'Asia/Seoul')::date + 13, interval '1 day') AS day
 WHERE EXTRACT(ISODOW FROM day) <> 7
ON CONFLICT (doctor_id, schedule_date) DO NOTHING;

-- 진찰료 (금액은 팀에서 확정 전 임시값: 피그마 기준)
INSERT INTO consultation_fee(fee_type, fee_amount, effective_from, set_by_staff_id)
SELECT t.fee_type, t.amount, TIMESTAMPTZ '2026-01-01 00:00:00+09', s.staff_id
  FROM (VALUES ('FIRST_VISIT', 18000), ('FOLLOW_UP', 15000)) AS t(fee_type, amount)
  JOIN staff s ON s.account_id = (SELECT account_id FROM user_account WHERE login_id = 'admin01')
ON CONFLICT (fee_type, effective_from) DO NOTHING;

-- 환자 1명 (회원가입 화면으로 더 만들어도 됨)
INSERT INTO patient(account_id, patient_name, birth_date, gender, phone, privacy_agreed_at)
SELECT account_id, '테스트환자', DATE '1990-01-01', 'F', '01000000001', now() FROM user_account a
 WHERE login_id = 'patient01' AND NOT EXISTS (SELECT 1 FROM patient p WHERE p.account_id = a.account_id);

COMMIT;

-- 확인
SELECT a.login_id, a.role, s.staff_id, d.doctor_id, p.patient_id
  FROM user_account a LEFT JOIN staff s USING (account_id) LEFT JOIN doctor d USING (account_id) LEFT JOIN patient p USING (account_id)
 ORDER BY a.account_id;
