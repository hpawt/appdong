export function load({ locals }) {
	// hooks.server.js에서 처리한 사용자 정보(locals.user)를 가져옵니다.
	// 이 return 값이 +layout.svelte의 `data` props로 전달됩니다.
	return {
		user: locals.user
	};
}
