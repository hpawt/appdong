const titles = {
	'/': '경북대학교 중앙동아리 앱동',
	'/about-us': '동아리 소개',
	'/about-us/members': '임원진 소개',
	'/announce': '공지사항',
	'/accession': '모집 안내',
	'/accession/application': '지원서 접수',
	'/login': '로그인',
	'/signup': '회원가입',
	'/forgot-password': '비밀번호 안내',
	'/my-page': '마이페이지',
	'/calendar': '일정 캘린더',
	'/forms': '신청·설문'
};

/** @param {string} pathname @param {{announcement?: {title?: string}, definition?: {title?: string}}} [data] */
export function pageMetadata(pathname, data = {}) {
	const name = pathname.startsWith('/announce/')
		? data.announcement?.title || '공지사항'
		: pathname.startsWith('/forms/')
			? data.definition?.title || '신청·설문'
			: titles[/** @type {keyof typeof titles} */ (pathname)] || 'APPDONG';
	return {
		title: `${name} · APPDONG`,
		description: pathname.startsWith('/accession')
			? '현재는 모집 기간이 아닙니다. 다음 모집은 APPDONG 공지사항에서 확인해주세요.'
			: `${name}. 경북대학교 중앙동아리 앱동 공식 웹사이트입니다.`,
		canonical: `https://www.appdong.com${pathname}`,
		noindex:
			/^\/(?:admin|login|signup|logout|my-page|forgot-password|accession|calendar|forms|demo)(?:\/|$)/.test(
				pathname
			)
	};
}
