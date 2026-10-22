/*
 * Seed-gate fixture (spec §4 "Done when": the schemas parse the CURRENT
 * hard-coded content without errors).
 *
 * Every string below is transcribed from the site repo
 * (`website/my-project/src/content/…`) at commit f1d2de8 — nothing here is
 * invented. It is a documented SUBSET: enough to prove the shapes line up and
 * to pin the two gaps the full seed will have to handle. The exhaustive,
 * automated version of this is Phase 10's `scripts/seed-from-site.ts`.
 *
 * Sources per record are named in the comments. Typographic apostrophes and
 * dashes are the site's own (\u2019, \u2013).
 *
 * Two findings this fixture deliberately surfaces (see the tests):
 *
 *   1. The HOME hero copy and the home intro statement do NOT live in
 *      `src/content` — they are composed in `HeroHeadline.tsx` / `Home.tsx`.
 *      The seed must lift them out of JSX before home can be published.
 *   2. `clients` has no logo files yet: the strip renders styled text
 *      wordmarks, and `logo` is required to publish a client. Real logo SVGs
 *      are an owner input.
 */

/** Stand-ins for media that does not exist in the bucket yet. */
const pendingMedia = (id: string, alt?: string) => ({
  mediaId: `med_${id.padEnd(26, '0').slice(0, 26)}`,
  ...(alt ? { alt } : {}),
})

// --- _site (from home.ts FOOTER + CompanyDetails in SiteHeader/Footer) ------

export const siteFixture = {
  companyName: 'Marino',
  email: 'hello@marino.co.uk',
  phone: '0161 660 6263',
  address: '1 St Peter\u2019s Sq, Manchester, M2 3DE',
  regNo: '11701108',
  vatNo: '371580590',
  defaultSeo: {
    titleTemplate: '%s | Marino',
    description:
      'Marino is a Manchester based digital marketing agency built for brands that want serious growth.',
  },
}

// --- _navigation (from routes.ts + SiteHeader) ------------------------------

export const navigationFixture = {
  items: [
    { label: 'Services', to: '/services' },
    { label: 'Work', to: '/work' },
    { label: 'About', to: '/about' },
    { label: 'Culture', to: '/culture' },
    { label: 'Blog', to: '/blog' },
    { label: 'Testimonials', to: '/testimonials' },
  ],
  cta: { label: 'Contact Us', to: '/contact' },
}

// --- _footer (from home.ts FOOTER) ------------------------------------------

/*
 * `statement` is a RichSegment[] on the site; the seed runs it through
 * `fromSegments()` to get this inline string. Links that the site renders as
 * `{ label, href }` become `[label](/href)`.
 */
export const footerFixture = {
  statement:
    'Marino is a Manchester based digital marketing agency helping brands grow with smart, results-focused ' +
    '[Branding](/branding), [Web Design](/web-design), [SEO](/seo-manchester), [PPC](/ppc-manchester), and [Video](/video-production).',
  links: [
    { label: 'Services', to: '/services' },
    { label: 'Work', to: '/work' },
    { label: 'About', to: '/about' },
    { label: 'Culture', to: '/culture' },
    { label: 'Blog', to: '/blog' },
    { label: 'Testimonials', to: '/testimonials' },
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms & Conditions', to: '/terms-and-conditions' },
  ],
  ctaLabel: 'Get in Touch',
  ctaTo: '/contact',
}

// --- _services (from services.ts SERVICES_HERO / SERVICES_INTRO) ------------

export const servicesIndexFixture = {
  hero: {
    label: 'Services',
    title: 'What We Do',
    pills: ['Marketing under one roof', 'Senior specialists'],
  },
  introStatement: {
    /*
     * The site keeps highlights in a separate array; the CMS grammar moves them
     * inline as ==…== (spec §2.3). "sharp strategists" stays unhighlighted, as
     * on the live page.
     */
    text:
      'Our team is made up of ==bold creatives,== sharp strategists, and ==technical pros== who care deeply about what they do. No egos, no fluff \u2013 just hard work, smart thinking, and a ==genuine commitment== to our clients\u2019 ==success.==',
  },
  latestWorkIntro:
    'Whether you\u2019re part of a multi-national company, an independent business venture or something in between, we would love to hear from you and together we can earn the trust of your future business prospects.',
}

// --- _work (hero copy lives in WorkPage.tsx; page size from projects.ts) ----

export const workIndexFixture = {
  pageSize: 13,
}

// --- service_page: web-design -----------------------------------------------

export const webDesignFixture = {
  seo: {
    title: 'Web Design Manchester | Website Design Agency | Marino',
    description:
      'Marino is a Manchester web design agency creating bespoke websites built to look sharp, convert better, and support business growth.',
  },
  hero: {
    badge: 'Web Design Manchester',
    title: 'Web Design services that turn heads and grow revenue',
    chips: ['Web Design', 'UX / UI', 'eCommerce', 'Wireframes', 'Conversion Rate Optimisation'],
    intro:
      'Your brand\u2019s website is arguably the single most important digital asset you own, and we don\u2019t think that it\u2019s too much to ask for it to look good and perform well. Our web design services give businesses a platform that helps you hit commercial goals while also expressing your brand in distinct, inventive ways.',
    formHeading: 'Request a free consultation today',
    formHighlight: 'free consultation',
    submitLabel: 'Request Consultation',
  },
  feature: {
    heading: 'Your website is where you grow your business',
    checklist: [
      'Site architecture',
      'Optimised for search',
      'Distinctive web design',
      'Multi-channel ready',
      'Scalable sites',
      'Conversion-focused layouts',
    ],
  },
  projects: { tag: 'Web Design', limit: 6 },
  pillars: {
    items: [
      {
        title: 'Site architecture',
        body: 'To be successful, a website needs a solid foundation, and our team at Marino ensures this by creating logical site structures from day one.',
      },
      {
        title: 'Optimised for search',
        body: 'A nice-looking site can\u2019t make sales or bring in enquiries if it isn\u2019t found for the terms audiences are searching for.',
      },
    ],
  },
  faq: {
    items: [
      {
        q: 'How long does a web design project take?',
        a: 'The timeline for a web design project depends on factors such as scope and content requirements. Most Manchester web design projects take between 8 and 12 weeks, but larger builds may take longer.',
      },
      {
        q: 'Do you build SEO-ready websites?',
        a: 'All of our websites are built with technical SEO foundations in place from day one.',
      },
    ],
  },
}

// --- home -------------------------------------------------------------------

/*
 * Home hero (pills + three videos) and `introStatement.text` are intentionally
 * ABSENT: that copy is composed inside JSX, not `src/content` (finding 1
 * above). The tests assert that publishing home reports exactly those two
 * paths, which is the seed's remaining work rather than a schema defect.
 */
export const homeFixture = {
  latestWork: {
    heading: 'Our latest work',
    intro:
      'Marino is a Manchester based digital marketing agency built for brands that want serious growth.',
    featuredProjects: [
      { slug: 'wr-partners', column: 'right' },
      { slug: 'office-insight', column: 'right' },
      { slug: 'latakoo', column: 'left' },
      { slug: 'vislink', column: 'left' },
    ],
    viewAll: { label: 'View all work', to: '/work' },
  },
  stats: {
    marquee: ['100 verified 5 star reviews', 'Generated \u00a3100 million in revenue'],
    pills: ['Decades of experience', 'Clients in 30 countries'],
    ctaText: 'Send us a brief and we\u2019ll talk',
    ctaLabel: 'Contact Us',
    ctaTo: '/contact',
  },
  insights: {
    heading: 'What\u2019s happening?',
    articles: [
      'marino-appointed-as-seo-agency-for-muse',
      'what-vislinks-progress-says-about-getting-the-foundations-right',
      'from-3m-to-17m-the-digital-side-of-bbs-laws-growth',
      'what-a1s-proves-about-long-term-seo',
    ],
    viewAll: { label: 'View all articles', to: '/blog' },
  },
  caseStudy: {
    heading: 'Marino: The results driven agency',
    stat: '400%',
    statLabel: 'Revenue growth',
    blurb:
      'Blackbird, an AIM-listed SaaS developer, achieved 400% revenue growth and $3.9M ARR through brand, web, and inbound marketing, generating 1,000+ MQLs, $1.8M pipeline and 650% growth in web traffic.',
    cta: { label: 'View Work', to: '/work' },
    testimonial: {
      quote:
        '\u201cWe\u2019ve worked with Marino for 5 years. Their digital marketing expertise has consistently driven awareness, interest, and leads.\u201d',
      name: 'Adrian Lambert',
      company: 'Blackbird',
    },
  },
  faq: {
    heading: 'Frequently asked questions',
    intro:
      'An independent agency in Manchester, founded in 2015, building brands, websites, and marketing that improve the bottom line.',
    items: [
      {
        q: 'What digital marketing services does Marino offer?',
        a: 'Marino offers all manner of digital marketing services that, when integrated, help to sustainably grow a business\u2019s online presence. Our core services include paid and organic channels such as [PPC](/ppc-manchester) and [SEO](/seo-manchester).',
      },
      {
        q: 'How does Marino build marketing strategies?',
        a: 'Every strategy starts by understanding your business, its goals, challenges, and how audiences in your industry behave online.',
      },
    ],
  },
  founder: {
    heading: 'Work directly with Marino founder Toni Marino',
    paragraphs: [
      'Marino was founded by Toni Marino, an [SEO consultant](/seo-consultant) with over 15 years of experience helping businesses improve their online visibility.',
      'In essence, marketing activity should always support the business outcomes that create significant transformation rather than generate impressive-looking numbers on a dashboard.',
    ],
    cta: { label: 'Work directly with Toni', to: '/seo-consultant' },
  },
}

// --- services (collection, from home.ts SERVICES) ---------------------------

/*
 * SEED RULE: the site's `Keyword = string | { label, href }` becomes the spec's
 * uniform `{ label, to? }` (spec §2.1). A bare string is a label with no link
 * and is written as `{ label }` — the seed applies that mapping, it is not part
 * of the stored shape.
 */
const keyword = (label: string, to?: string) => (to ? { label, to } : { label })

export const servicesFixture = [
  {
    slug: 'branding',
    title: 'Branding',
    description:
      'Distinctive brands built with clarity, character, and lasting commercial impact.',
    keywords: ['Strategy', 'Design', 'Brand Guidelines', 'Tone of Voice', 'Repositioning'].map((k) =>
      keyword(k),
    ),
    sort: 0,
    showOnHome: true,
    pageSlug: 'branding',
  },
  {
    slug: 'web-design',
    title: 'Web Design',
    description:
      'Beautifully built websites designed to engage, convert, and perform at scale.',
    keywords: [
      'UX & UI Design',
      'Conversion-Focused Design',
      'Landing Pages',
      'Website Development',
    ].map((k) => keyword(k)),
    sort: 1,
    showOnHome: true,
    pageSlug: 'web-design',
  },
  {
    slug: 'seo-manchester',
    title: 'SEO',
    description:
      'SEO built for modern search \u2013 helping brands show up across Google, AI answers, and recommendations.',
    /* On the /services page "AI SEO" becomes an inline link (services.ts). */
    keywords: [
      'Technical SEO',
      'On-Page SEO',
      'Content Strategy',
      'Local SEO',
      keyword('AI SEO', '/ai-seo'),
      'Digital PR',
      'Link Building',
    ].map((k) => (typeof k === 'string' ? keyword(k) : k)),
    sort: 2,
    showOnHome: true,
    pageSlug: 'seo-manchester',
  },
  {
    slug: 'ppc-manchester',
    title: 'PPC',
    description:
      'Paid media managed with precision to deliver efficient growth and measurable returns.',
    keywords: [
      'Google Ads',
      'Shopping Campaigns',
      'Remarketing',
      'Conversion Tracking',
      'Display Advertising',
    ].map((k) => keyword(k)),
    sort: 3,
    showOnHome: true,
  },
  {
    slug: 'video-production',
    title: 'Video',
    description:
      'Cinematic video content created to elevate brands and move audiences to action.',
    keywords: ['Brand Videos', 'Testimonial Videos', 'Event Videos', 'Social Content', 'Product Videos'].map(
      (k) => keyword(k),
    ),
    sort: 4,
    showOnHome: true,
  },
]

// --- projects (collection, from projects.ts) --------------------------------

/* Focus strings like 'center 35%' become normalised focus points. */
export const projectsFixture = [
  {
    slug: 'wr-partners',
    title: 'WR Partners',
    services: ['Branding', 'Web Design', 'SEO', 'PPC', 'Video'],
    cardFocus: { x: 0.5, y: 0.35 },
    featured: true,
    sort: 0,
  },
  {
    slug: 'office-insight',
    title: 'Office Insight',
    services: ['Web Design', 'SEO', 'PPC'],
    cardFocus: { x: 0.5, y: 0.5 },
    featured: true,
    sort: 1,
  },
  {
    slug: 'latakoo',
    title: 'Latakoo',
    services: ['Branding', 'Web Design', 'SEO', 'PPC'],
    cardFocus: { x: 0.6, y: 0.4 },
    featured: true,
    sort: 2,
  },
  {
    slug: 'vislink',
    title: 'Vislink',
    services: ['Branding', 'Web Design', 'SEO', 'PPC', 'Video'],
    cardFocus: { x: 0.55, y: 0.45 },
    featured: true,
    sort: 3,
  },
]

// --- testimonials (collection, from home.ts TESTIMONIALS) -------------------

export const testimonialsFixture = [
  {
    quote: '\u201cAbsolutely fantastic team to work with!\u201d',
    author: 'Atem Eyong',
    company: 'Hard Rock Cafe',
    sort: 0,
  },
  {
    quote:
      '\u201cIf you are looking for a superb, competent, and fast creative partner, this is it.\u201d',
    author: 'Joe Weagraff',
    company: 'Hitachi',
    sort: 1,
  },
  {
    quote:
      '\u201cThe quality was excellent, and communication throughout was clear and professional. I highly recommend Marino.\u201d',
    author: 'Abbie Booth',
    company: 'Istobal',
    sort: 2,
  },
]

// --- clients (collection, from ClientLogoStrip.tsx MARQUEE_LOGOS) -----------

/*
 * Finding 2: these render as styled text today and there are no logo files, so
 * `logo` (required) is intentionally missing — publishing a client needs a real
 * SVG/PNG from the owner.
 */
export const clientsFixture = [
  { name: 'emap', sort: 0 },
  { name: 'WR Partners', sort: 1 },
  { name: 'Hard Rock Cafe', sort: 2 },
  { name: 'ISTOBAL', sort: 3 },
  { name: 'LEONARDO Hotels', sort: 4 },
  { name: 'HITACHI', sort: 5 },
  { name: 'Haines Watts', sort: 6 },
  { name: 'VISLINK', sort: 7 },
  { name: 'AP NUT', sort: 8 },
]

// --- articles (collection, from home.ts ARTICLES) ---------------------------

export const articlesFixture = [
  {
    slug: 'marino-appointed-as-seo-agency-for-muse',
    title: 'Marino appointed as SEO agency for MUSE',
    date: '2026-07-01',
    excerpt:
      'We\u2019re excited to announce that Marino has been appointed as the SEO agency for MUSE, the global talent and creative agency.',
    categories: ['SEO'],
    sort: 0,
  },
  {
    slug: 'what-vislinks-progress-says-about-getting-the-foundations-right',
    title: 'What Vislink\u2019s progress says about getting the foundations right',
    date: '2026-07-01',
    excerpt:
      'Seeing Mickey share Vislink\u2019s latest numbers is a great moment and they are the kind of numbers worth paying attention to.',
    categories: ['Branding', 'Web Design', 'SEO', 'PPC', 'Video'],
    sort: 1,
  },
]

/** A media id used by tests that need a well-formed reference. */
export const sampleMediaId = pendingMedia('01J8ZQ0000000000000000000A')
