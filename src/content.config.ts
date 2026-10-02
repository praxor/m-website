import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		order: z.number().int().min(1).max(100).optional(),
		type: z.enum(['update', 'post']).default('update'),
		description: z.string().optional(),
		banner: z.string().optional(),
		image: z.string().optional(),
		imageAlt: z.string().optional(),
		draft: z.boolean().default(false),
	}),
});

export const collections = { posts };