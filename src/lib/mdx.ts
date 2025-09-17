import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Lead from '@components/Lead'
import ProsCons, { Pros, Cons } from '@components/ProsCons'
import CTAButtons from '@components/CTAButtons'
import CompareTable from '@components/CompareTable'
import ReviewCard from '@components/ReviewCard'
import Button from '@components/cta/Button'
import { Rating } from '@components/Rating'
import TOC from '@components/TOC'

import type { Post } from './posts-fs'

const components = {
  Lead,
  ProsCons,
  Pros,
  Cons,
  CTAButtons,
  CompareTable,
  ReviewCard,
  Button,
  Rating,
  TOC,
}

export async function renderMDX(post: Post) {
  const { content } = post
  const mdx = await compileMDX<Record<string, unknown>>({
    source: content,
    components,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
      },
    },
  })
  return mdx.content
}
