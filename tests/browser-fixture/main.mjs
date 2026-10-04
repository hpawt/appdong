import { mount, unmount } from 'svelte';
import ApplicationForm from '../../src/lib/components/ApplicationForm.svelte';
import AnnouncementPage from '../../src/routes/announce/[id]/+page.svelte';
import AnnouncementForm from '../../src/lib/components/AnnouncementForm.svelte';
import FormBuilder from '../../src/lib/components/FormBuilder.svelte';
import CalendarBoard from '../../src/lib/components/CalendarBoard.svelte';
import EventForm from '../../src/lib/components/EventForm.svelte';
import QuestionFields from '../../src/lib/components/QuestionFields.svelte';
import '../../src/routes/styles.css';

const editing = new URL(location.href).searchParams.has('edit');
const kind = new URL(location.href).searchParams.get('component');
const sampleEvent = {
	id: 'calendar-test',
	title: '월 경계 행사',
	description: '함께 참여해요.',
	location: '동아리방',
	startDate: '2026-09-30',
	endDate: '2026-10-02',
	time: '18:30',
	category: 'event',
	pinned: true
};
const questions = [
	{ id: 'text', title: '이름', type: 'text', required: true, options: [] },
	{ id: 'email', title: '이메일', type: 'email', required: true, options: [] },
	{ id: 'textarea', title: '남길 말', type: 'textarea', required: false, options: [] },
	{ id: 'radio', title: '참가 방식', type: 'radio', required: true, options: ['온라인', '현장'] },
	{
		id: 'checkbox',
		title: '참여 시간',
		type: 'checkbox',
		required: true,
		options: ['오전', '오후']
	},
	{ id: 'select', title: '식사', type: 'select', required: false, options: ['신청', '미신청'] }
];
let component;
if (kind === 'announcement')
	component = mount(AnnouncementPage, {
		target: document.getElementById('app'),
		props: {
			data: {
				announcement: {
					title: '서식이 있는 공지',
					authorName: '운영진',
					createdAt: '2026-10-04T00:00:00Z',
					attachments: [],
					content:
						'<p class="ql-align-right">오른쪽 정렬</p><p><span class="ql-size-large">큰 글씨</span></p><ol><li data-list="bullet">목록 항목</li></ol>'
				}
			}
		}
	});
else if (kind === 'application')
	component = mount(ApplicationForm, {
		target: document.getElementById('app'),
		props: { data: { user: null, userData: null, alreadySubmitted: false }, form: null }
	});
else if (kind === 'builder')
	component = mount(FormBuilder, { target: document.getElementById('app') });
else if (kind === 'calendar')
	component = mount(CalendarBoard, {
		target: document.getElementById('app'),
		props: { month: '2026-10', events: [sampleEvent], pinnedEvents: [sampleEvent], admin: true }
	});
else if (kind === 'event') component = mount(EventForm, { target: document.getElementById('app') });
else if (kind === 'questions')
	component = mount(QuestionFields, {
		target: document.getElementById('app'),
		props: { questions }
	});
else
	component = mount(AnnouncementForm, {
		target: document.getElementById('app'),
		props: {
			initialTitle: editing ? '기존 공지' : '',
			initialContent: editing ? '<p>기존 내용</p>' : '',
			initialAttachments: editing ? [{ name: '기존.pdf', url: 'https://example.test/old.pdf' }] : []
		}
	});
document.getElementById('unmount').addEventListener('click', () => unmount(component));
