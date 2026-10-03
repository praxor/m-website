import { getCollection } from 'astro:content';

type OrderedPost = {
	id: string;
	data: {
		date: Date;
		order?: number;
	};
};

export const comparePostsByDateAndOrder = (first: OrderedPost, second: OrderedPost) =>
	second.data.date.getTime() - first.data.date.getTime()
	|| (second.data.order ?? 50) - (first.data.order ?? 50)
	|| second.id.localeCompare(first.id);
export const getVisiblePostIds = async () => (await getCollection('posts', ({ data }) => !data.draft || !import.meta.env.PROD)).map((post) => post.id);
