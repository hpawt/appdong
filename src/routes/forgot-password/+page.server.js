import { fail } from '@sveltejs/kit';

// 개인 식별 정보와 클라이언트가 보낸 사용자 ID는 비밀번호 복구 인증 수단이 아닙니다.
const unavailable = () =>
	fail(403, { message: '비밀번호 재설정은 동아리 운영진에게 문의해주세요.' });
export const actions = { verifyUser: unavailable, resetPassword: unavailable };
