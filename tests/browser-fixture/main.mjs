import { mount, unmount } from 'svelte';
import AnnouncementForm from '../../src/lib/components/AnnouncementForm.svelte';

const editing = new URL(location.href).searchParams.has('edit');
const component = mount(AnnouncementForm, {
	target: document.getElementById('app'),
	props: {
		initialTitle: editing ? '기존 공지' : '',
		initialContent: editing ? '<p>기존 내용</p>' : '',
		initialAttachments: editing ? [{ name: '기존.pdf', url: 'https://example.test/old.pdf' }] : []
	}
});
document.getElementById('unmount').addEventListener('click', () => unmount(component));
