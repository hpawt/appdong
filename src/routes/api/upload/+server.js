import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { requireAdmin } from '$lib/server/permissions';
import { validateUpload } from '$lib/server/uploads';

export async function POST({ request, locals }) {
	requireAdmin(locals);
	const { file, name, extension, contentType } = await validateUpload(
		(await request.formData()).get('file')
	);
	const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
	const key = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
	if (!url || !key) error(503, '파일 업로드 서비스가 설정되지 않았습니다.');
	const supabase = createClient(url, key, {
		auth: { persistSession: false, autoRefreshToken: false }
	});
	const fileName = `${crypto.randomUUID()}.${extension}`;
	const { error: uploadError } = await supabase.storage
		.from('announcements')
		.upload(fileName, file, { contentType, upsert: false });
	if (uploadError) error(502, '파일 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
	const {
		data: { publicUrl }
	} = supabase.storage.from('announcements').getPublicUrl(fileName);
	return json({ url: publicUrl, name });
}
