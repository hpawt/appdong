export const menuData = [
	{
		title: 'About Us',
		path: '/about-us',
		columns: [
			{
				links: [
					{ text: '동아리 소개', path: '/about-us' },
					// { text: '활동 내용', path: '/about-us/activities' },
					{ text: '조직도', path: '/about-us/members' }
				]
			}
		]
	},

	// {
	// 	title: '자료실',
	// 	path: '',
	// 	columns: [
	// 		{
	// 			links: [
	// 				{ text: '스터디 자료', path: '/resources/study' },
	// 				{ text: '프로젝트 결과물', path: '/resources/projects' }
	// 			]
	// 		}
	// 	]
	// },

	{
		title: '가입안내',
		path: '/accession',
		columns: [
			{
				links: [
					{ text: '모집 요강', path: '/accession' },
					{ text: '지원서 작성', path: '/accession/application' }
				]
			}
		]
	}
];
