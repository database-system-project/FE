import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { EmptyAvatar } from "../../components/EmptyAvatar";
import { PageHeader } from "../../components/PageHeader";

export function PatientInfo() {
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PageHeader
        title="내 정보"
        description="예약과 진료에 사용되는 환자 기본정보를 확인하고 수정할 수 있습니다."
      />
      <div className="profile-layout">
        <section className="patient-panel">
          <div className="patient-profile">
            <EmptyAvatar name="홍길동" />
            <div>
              <h2>홍길동</h2>
              <p>환자번호 100001</p>
            </div>
          </div>
          <dl>
            <div>
              <dt>환자번호</dt>
              <dd>100001</dd>
            </div>
            <div>
              <dt>로그인 아이디</dt>
              <dd>patient01</dd>
            </div>
            <div>
              <dt>생년월일</dt>
              <dd>1984.05.18</dd>
            </div>
            <div>
              <dt>성별</dt>
              <dd>남성</dd>
            </div>
          </dl>
          <div className="info-banner profile-notice">
            <Icon name="warning" size={18} />
            <span>
              <b>수정 제한 정보</b>
              <small>생년월일 또는 성별 수정이 필요한 경우 원무 직원에게 문의해 주세요.</small>
            </span>
          </div>
        </section>
        <section className="clinical-form">
          <div className="card-title">
            <div>
              <h2>정보 수정</h2>
              <p>이름, 전화번호, 비밀번호만 직접 변경할 수 있습니다.</p>
            </div>
            {saved && <Badge tone="green">수정 완료</Badge>}
          </div>
          <label className="field">
            <span>이름</span>
            <input defaultValue="홍길동" />
          </label>
          <label className="field">
            <span>전화번호</span>
            <input defaultValue="010-1234-5678" />
          </label>
          <label className="field">
            <span>새 비밀번호</span>
            <input type="password" placeholder="변경할 경우에만 입력하세요" />
          </label>
          <label className="field">
            <span>새 비밀번호 확인</span>
            <input type="password" placeholder="비밀번호를 다시 입력하세요" />
          </label>
          <div className="clinical-actions">
            <Button onClick={() => setSaved(true)}>정보 수정</Button>
          </div>
        </section>
      </div>
    </>
  );
}
