import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Lead from '@components/Lead'
import ProsCons from '@components/ProsCons'
import CTAButtons from '@components/CTAButtons'
import ComparisonTable from '@components/ComparisonTable'

import type { Post } from './posts-fs'

const components = { Lead, ProsCons, CTAButtons, ComparisonTable }

export async function renderMDX(post: Post) {
  const { content } = post
  const mdx = await compileMDX<{ }>(
    {
      source: content,
      components,
      options: {
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
        },
      },
    }
  )
  return mdx.content
}

