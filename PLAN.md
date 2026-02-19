KRDS(정부 디자인 시스템) 준수 사항을 프로젝트의 핵심 가이드라인으로 추가하여 수정된 **CMS 프로젝트 통합 개발 계획서(v4.0)**입니다.

KRDS는 공공기관 웹사이트의 접근성, 일관성, 사용성을 보장하는 표준이므로 이를 설계 단계부터 반영하는 것이 중요합니다.

---

# 🚀 모듈형 CMS 프로젝트 통합 개발 계획서 (v4.0)

본 문서는 **egovframework 4.3 (Java 17)** 환경에서 **Tomcat 10**과 **MariaDB**를 기반으로 하며, 특히 **KRDS(Korea Design System)**를 UI/UX 표준으로 필수 적용하는 모듈형 CMS 구축 로드맵입니다.

## 1. 프로젝트 개요

* **프레임워크:** egovframework 4.3 (Spring Boot 3.x 기반)
* **언어:** Java 17 (Jakarta EE 10 지원)
* **WAS:** Apache Tomcat 10.1
* **Database:** MariaDB (기본)
* **UI/UX 표준:** **KRDS(정부 디자인 시스템) 필수 준수** [핵심]
* **핵심 컨셉:**
* **Modular Architecture:** 기능별 독립 모듈화로 선택적 운영 가능
* **API-First (Headless):** 모든 기능을 REST API로 우선 구현
* **Cloud Ready:** 파일 저장소 및 인프라의 유연한 확장성 확보



## 2. UI/UX 디자인 원칙 (KRDS 준수)

KRDS 지침에 따라 사용자 경험의 일관성을 확보합니다.

* **컴포넌트 표준:** KRDS에서 제공하는 버튼, 입력 폼, 내비게이션, 모달 등 표준 컴포넌트 라이브러리 활용
* **웹 접근성:** '한국 웹 콘텐츠 접근성 지침(KWCAG)'을 기반으로 시각 장애인 및 고령자 배려 설계
* **반응형 설계:** 다양한 디바이스(PC, 모바일, 태블릿)에서 최적화된 레이아웃 제공
* **일관된 시각 언어:** 정부 표준 색상 체계, 타이포그래피, 아이콘 시스템 적용

## 3. 모듈 구조 및 기능 배치 (Modularization)

| 모듈 그룹 | 주요 기능 |
| --- | --- |
| **A. Core & Infra** | 공통 코드(code), 로그 저장 기간(logstrepd), 공통 기능(파일/에디터) |
| **B. IAM (인증/권한)** | 사용자(user), 권한(author), 메뉴(menu), 권한 메뉴(authmenu), 접근 제어(access) |
| **C. Content Service** | 게시판(board), 게시물(bbsmng), 콘텐츠(cnts), 사진 관리(photo) |
| **D. Marketing & UI** | 배너(banners), 팝업(popup) - **KRDS UI 컴포넌트 적용 대상** |
| **E. Compliance** | 통계(stats), 개인정보 처리 방침(prvc) |

---

## 4. 단계별 개발 로드맵

### Phase 1: 환경 구축 및 디자인 시스템 정의

* [ ] egovframework 4.3 기반 멀티 모듈 프로젝트 세팅
* [ ] **KRDS 분석 및 테마 설정:** KRDS 가이드라인에 따른 CSS Framework(또는 SCSS) 테마 구축
* [ ] API-First 전략: Swagger 기반의 REST API 규격 정의 및 MariaDB 초기 스키마 설계

### Phase 2: 인증 및 핵심 기반 개발 (IAM & Core)

* [ ] Spring Security 기반의 권한/메뉴 접근 제어 체계 구축
* [ ] **Audit Trail 구현:** 데이터 변경 이력을 기록하는 공통 감사 로그 기능
* [ ] KRDS 표준 레이아웃(GNB, LNB, Footer) 마스터 템플릿 제작

### Phase 3: 콘텐츠 서비스 및 UI/UX 구현

* [ ] 게시판/게시물/콘텐츠 관리 모듈 구현
* [ ] **KRDS 컴포넌트 적용:** 모든 관리자/사용자 화면에 KRDS 표준 UI 요소 도입
* [ ] **Low-code 빌더:** KRDS 가이드라인 범위 내에서 동적 필드 구성 기능 개발

### Phase 4: 검증 및 운영 고도화

* [ ] **접근성 자가 진단:** KRDS 및 KWCAG 준수 여부 정밀 점검
* [ ] Headless 확장: React/Vue.js 환경에서의 KRDS UI 라이브러리 연동 테스트
* [ ] 개인정보 보호 정책 및 Tomcat 10 배포 최적화

---

## 5. 발전 방향 상세 제안

1. **KRDS 기반 UI Kit 내재화:** CMS 내부적으로 KRDS 컴포넌트를 라이브러리화하여, 신규 모듈 추가 시 즉시 표준 UI를 호출할 수 있도록 구성합니다.
2. **Headless CMS 전환:** API와 UI를 분리하여, KRDS 외의 다른 디자인 시스템 요구사항이 생기더라도 백엔드 수정 없이 대응 가능하게 설계합니다.
3. **Storage Abstraction:** 로컬 및 클라우드(S3 등) 스토리지 선택 옵션을 제공하여 인프라 유연성을 확보합니다.
4. **데이터 감사 로그(Audit Trail) 강화:** '누가, 언제, 무엇을' 바꿨는지 JSON 형태로 상세 기록하여 보안성을 높입니다.

---

### GitHub 저장 방법

1. GitHub의 `README.md` 파일의 내용을 위 마크다운으로 수정하거나, 새 파일(`PLAN.md`)을 생성하여 저장하세요.
2. 커밋 메시지는 `docs: update CMS development plan with KRDS compliance` 정도로 작성하시는 것을 추천합니다.

이 계획으로 진행하시면 기술적 완성도와 더불어 공공 표준에 부합하는 수준 높은 CMS를 구축하실 수 있습니다. 다음 단계로 **KRDS의 특정 컴포넌트(예: 메뉴 구조나 폼 레이아웃)를 DB 스키마와 어떻게 매핑할지** 논의해 볼까요?
