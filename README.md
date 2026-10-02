# APPDONG

경북대학교 앱동 홈페이지. SvelteKit 2, Svelte 5, PostgreSQL, Drizzle을 사용합니다.

## 로컬 실행

Node.js 22.12 이상을 사용합니다. Windows PowerShell에서는 `npm.cmd`를 사용할 수 있습니다.

```powershell
npm.cmd ci
Copy-Item .env.example .env
docker compose up -d
npm.cmd run db:push
npm.cmd run dev
```

Docker는 로컬 DB 실행에 필요합니다. 기존 PostgreSQL을 쓰면 `.env`의 `DATABASE_URL`을 설정하세요. 로컬 DB는 `DATABASE_SSL=disable`, 운영 DB는 이 변수를 생략하면 SSL 연결을 사용합니다. DB 설정 없이도 공개 정적 페이지와 테스트를 실행할 수 있으며 공지 목록은 서비스 불가 안내를 표시합니다.

공지 업로드에는 Supabase의 공개 `announcements` Storage 버킷과 서버 환경 변수 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`가 필요합니다. 기존 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 설정도 서버에서 호환하지만 새 키는 `VITE_` 이름을 사용하지 마세요. 키는 서버에서만 읽습니다. 업로드는 관리자에게만 허용되며 파일당 10MB, 공지당 첨부파일 20개로 제한합니다. 지원 형식은 PNG/JPEG/GIF/WebP/PDF/TXT/ZIP/DOCX입니다.

## 권한과 계정

- 신규 가입자는 `USER`입니다. 최초 관리자는 DB 관리 도구에서 해당 계정의 `role`을 `ADMIN`으로 설정합니다.
- `/admin`은 서버 훅과 각 서버 작업에서 권한을 검사합니다. 회원, 지원서, 공지를 관리할 수 있습니다.
- 마이페이지는 현재 비밀번호를 확인한 뒤 정보를 수정하며, 비밀번호 변경은 모든 로그인 세션을 종료합니다.
- 공개 비밀번호 재설정은 차단되어 있습니다. 운영진은 본인 확인 후 **회원 관리 → 회원 상세 → 비밀번호 재설정**을 사용합니다.
- 세션은 1시간이며 유효 기간의 절반이 지나면 서버와 쿠키의 만료 시간을 함께 연장합니다.

## 검사와 테스트

```powershell
npm.cmd run check
npm.cmd run lint
npm.cmd run test:unit
npm.cmd run build
npm.cmd run test:e2e
```

`npm.cmd test`는 서버 테스트와 브라우저 테스트를 순서대로 실행합니다. Windows 브라우저 테스트는 설치된 Chrome을 사용합니다. 다른 운영체제에서는 Playwright Chromium을 설치하세요(`npx playwright install chromium`).

서버 테스트는 실제 서버 소스를 실행하고 DB와 세션 의존성만 대체합니다. 브라우저 테스트는 DB와 업로드 자격 증명을 비운 상태에서 빌드한 앱과 별도의 편집기 테스트 서버를 실행합니다. 편집기 테스트 서버는 운영 앱에 포함되지 않습니다. 실 DB 연결·동시 제출·Supabase 업로드는 별도의 연결 환경에서 확인해야 합니다.

## 구조

- `src/lib/server/permissions.js`: 로그인·관리자 검사
- `src/lib/server/validation.js`, `passwords.js`: 입력 검증과 비밀번호 처리
- `src/lib/server/auth.js`: 세션 생성·검증·갱신
- `src/lib/server/announcements.js`: 공지 입력 검증과 HTML 정리
- `src/lib/components/AnnouncementForm.svelte`: 공통 공지 작성·수정 편집기
- `tests/`, `e2e/`: 서버 및 브라우저 회귀 테스트

운영 DB에는 로컬 검사를 이유로 `db:push`를 실행하지 마세요. 배포 환경은 기존 adapter-auto 설정을 유지하며, 배포할 플랫폼에서 환경 변수를 설정해야 합니다.
