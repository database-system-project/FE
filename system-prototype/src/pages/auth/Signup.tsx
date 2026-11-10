import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";

export function Signup({ back }: { back: () => void }) {
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div className="auth-simple">
        <div className="success-card">
          <div className="success-icon">
            <Icon name="check" size={34} />
          </div>
          <h2>회원가입이 완료되었습니다</h2>
          <p>
            환자번호 <b>100127</b>이 자동 발급되었습니다.
            <br />
            이제 예약 서비스를 이용할 수 있습니다.
          </p>
          <Button onClick={back}>로그인하러 가기</Button>
        </div>
      </div>
    );
  return (
    <div className="auth-simple">
      <div className="signup-card">
        <button className="text-back" onClick={back}>
          ← 로그인으로 돌아가기
        </button>
        <div className="signup-title">
          <span className="brand-mark">
            <Icon name="logo" />
          </span>
          <div>
            <h2>환자 회원가입</h2>
            <p>예약 및 진료 조회를 위한 정보를 입력해 주세요.</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="field full">
            <span>아이디</span>
            <div className="input-action">
              <input placeholder="영문, 숫자 조합 6~20자" />
              <Button variant="outline">중복 확인</Button>
            </div>
          </label>
          <label className="field">
            <span>비밀번호</span>
            <input type="password" placeholder="8자 이상 입력" />
          </label>
          <label className="field">
            <span>비밀번호 확인</span>
            <input type="password" placeholder="비밀번호 재입력" />
          </label>
          <label className="field">
            <span>이름</span>
            <input placeholder="이름 입력" />
          </label>
          <label className="field">
            <span>생년월일</span>
            <input type="date" />
          </label>
          <label className="field">
            <span>성별</span>
            <select>
              <option>성별 선택</option>
              <option>남성</option>
              <option>여성</option>
            </select>
          </label>
          <label className="field">
            <span>전화번호</span>
            <input placeholder="010-0000-0000" />
          </label>
        </div>
        <label className="consent">
          <input type="checkbox" />
          <span>
            <b>[필수] 개인정보 수집·이용에 동의합니다.</b>
            <small>예약 및 진료 서비스 제공을 위해 최소한의 정보를 수집합니다.</small>
          </span>
          <button>보기</button>
        </label>
        <Button className="wide" onClick={() => setDone(true)}>
          회원가입 완료
        </Button>
        <p className="center-link">
          이미 가입된 계정이 있나요? <button>아이디 찾기</button>
        </p>
      </div>
    </div>
  );
}
