import { useState } from "react";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { PageHeader } from "../../components/PageHeader";

export function AdminTable({ type }: { type: string }) {
  const [modal, setModal] = useState(false);
  const config: Record<
    string,
    { title: string; desc: string; button: string; heads: string[]; rows: string[][] }
  > = {
    departments: {
      title: "진료과 관리",
      desc: "환자 예약에 노출되는 진료과를 관리합니다.",
      button: "진료과 등록",
      heads: ["진료과 코드", "진료과명", "소속 의사", "사용상태"],
      rows: [
        ["D001", "내과", "3명", "사용중"],
        ["D002", "소아청소년과", "2명", "사용중"],
        ["D003", "이비인후과", "1명", "사용중"],
        ["D004", "피부과", "2명", "사용중"],
      ],
    },
    accounts: {
      title: "사용자 계정 관리",
      desc: "역할별 계정과 사용 상태를 관리합니다.",
      button: "직원 계정 등록",
      heads: ["계정 ID", "이름", "역할", "생성일", "상태"],
      rows: [
        ["doctor01", "이정훈", "의사", "2026.03.02", "사용중"],
        ["desk01", "박원무", "원무 직원", "2026.03.02", "사용중"],
        ["cashier01", "최수납", "수납 담당자", "2026.04.11", "사용중"],
        ["patient01", "홍길동", "환자", "2026.06.28", "사용중"],
      ],
    },
    medicines: {
      title: "약품 관리",
      desc: "처방과 복약 안내에 사용하는 약품 기준정보를 관리합니다.",
      button: "약품 등록",
      heads: ["품목기준코드", "제품명", "업체명", "주요 효능", "사용상태"],
      rows: [
        ["202300112", "아세트아미노펜정 500mg", "한미약품", "해열 및 진통", "사용중"],
        ["202108421", "심바스타틴정 20mg", "유한양행", "고지혈증 치료", "사용중"],
        ["201906712", "이트라코나졸캡슐 100mg", "한국얀센", "진균 감염 치료", "사용중"],
        ["201508813", "코데인 함유 진해제 시럽", "대한약품", "기침 억제", "사용중지"],
      ],
    },
    interactions: {
      title: "병용금기 관리",
      desc: "두 약품의 동시 복용 위험 기준을 관리합니다.",
      button: "병용금기 등록",
      heads: ["약품 A", "약품 B", "금기 내용", "등록일"],
      rows: [
        [
          "심바스타틴정 20mg",
          "이트라코나졸캡슐 100mg",
          "동시 복용 시 근육 손상 위험 증가",
          "2026.08.01",
        ],
        ["와파린정 5mg", "아스피린정 100mg", "출혈 위험 증가", "2026.08.01"],
        ["클라리스로마이신정", "콜히친정", "콜히친 독성 위험 증가", "2026.09.14"],
      ],
    },
    "age-rules": {
      title: "연령금기 관리",
      desc: "환자 만 나이를 기준으로 처방 제한 조건을 관리합니다.",
      button: "연령금기 등록",
      heads: ["약품", "기준 나이", "조건", "금기 내용"],
      rows: [
        ["코데인 함유 진해제 시럽", "12세", "미만", "소아 호흡 억제 위험"],
        ["아스피린정 100mg", "16세", "미만", "레이 증후군 위험"],
        ["독시사이클린정 100mg", "8세", "미만", "치아 변색 및 법랑질 형성 저하"],
      ],
    },
  };
  const c = config[type] || config.departments;
  return (
    <>
      <PageHeader
        title={c.title}
        description={c.desc}
        actions={
          <Button icon="plus" onClick={() => setModal(true)}>
            {c.button}
          </Button>
        }
      />
      <div className="toolbar">
        <div className="search">
          <Icon name="search" />
          <input placeholder="검색어를 입력하세요" />
        </div>
        <select>
          <option>전체 상태</option>
          <option>사용중</option>
          <option>사용중지</option>
        </select>
        <Button variant="outline">검색</Button>
      </div>
      <div className="data-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {c.heads.map((h) => (
                  <th key={h}>{h}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((v, j) => (
                    <td
                      key={j}
                      className={
                        j === 0 && type !== "interactions" && type !== "age-rules" ? "code" : ""
                      }
                    >
                      {j === 1 || (j === 0 && type === "age-rules") ? (
                        <b>{v}</b>
                      ) : v === "사용중" ? (
                        <Badge tone="green">{v}</Badge>
                      ) : v === "사용중지" ? (
                        <Badge tone="gray">{v}</Badge>
                      ) : (
                        v
                      )}
                    </td>
                  ))}
                  <td>
                    <button className="text-link">상세 / 수정</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {type === "medicines" && (
        <div className="medicine-detail-preview">
          <div>
            <span className="section-kicker">SELECTED MEDICINE</span>
            <h3>아세트아미노펜정 500mg</h3>
            <p>품목기준코드 202300112 · 한미약품</p>
          </div>
          <dl>
            <div>
              <dt>효능</dt>
              <dd>감기로 인한 발열 및 통증 완화</dd>
            </div>
            <div>
              <dt>사용법</dt>
              <dd>성인 1회 1~2정, 1일 3~4회 복용</dd>
            </div>
            <div>
              <dt>주의사항</dt>
              <dd>일일 최대 복용량을 초과하지 마십시오.</dd>
            </div>
            <div>
              <dt>보관법</dt>
              <dd>실온, 습기를 피해 보관</dd>
            </div>
          </dl>
        </div>
      )}
      {modal && (
        <div className="modal-layer">
          <div className="modal small-modal">
            <button className="modal-close" onClick={() => setModal(false)}>
              <Icon name="close" />
            </button>
            <span className="section-kicker">NEW RECORD</span>
            <h2>{c.button}</h2>
            <p>업무에 사용할 기준정보를 입력하세요.</p>
            <label className="field">
              <span>명칭 / 약품</span>
              <input placeholder="내용을 입력하세요" />
            </label>
            <label className="field">
              <span>상세 내용</span>
              <textarea placeholder="상세 내용을 입력하세요" />
            </label>
            <div className="modal-actions">
              <Button variant="outline" onClick={() => setModal(false)}>
                취소
              </Button>
              <Button onClick={() => setModal(false)}>등록</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
