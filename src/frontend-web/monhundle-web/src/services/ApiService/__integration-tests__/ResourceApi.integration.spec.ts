import { beforeEach, describe, expect, it } from 'vitest'
import { HttpResponse, http } from 'msw'
import { server } from '@/mocks/vitest.setup'
import ResourceApi from '@/services/ApiService/ResourceApi'


describe('ResourceApi — game titles (integration)', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  it('sends a well-formed request: GET, no query string', async () => {
    let capturedMethod: string | null = null
    let capturedUrl: string | null = null
    server.use(
      http.get('*/resources/game-titles', ({ request }) => {
        capturedMethod = request.method
        capturedUrl = request.url
        return HttpResponse.json([])
      }),
    )

    await new ResourceApi().getGameTitles()

    expect(capturedMethod).toBe('GET')
    expect(new URL(capturedUrl!).search).toBe('')
  })

  it('parses the response body into a list of titles (default handler)', async () => {
    const titles = await new ResourceApi().getGameTitles()

    expect(titles).toEqual(['MHW', 'MHR'])
  })
})

describe('ResourceApi — monster choices (integration)', () => {
  it('omits the query string entirely when no game titles are given', async () => {
    let capturedUrl: string | null = null
    server.use(
      http.get('*/resources/monster-choices', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      }),
    )

    await new ResourceApi().getMonstersOptions([])

    // Not just "no gameTitles param" — the code path takes a different branch entirely
    // when the list is empty (see ResourceApi.ts), so the whole query string should be
    // absent, not present-but-empty.
    expect(new URL(capturedUrl!).search).toBe('')
  })

  it('sends a comma-separated gameTitles query when titles are given', async () => {
    let capturedUrl: string | null = null
    server.use(
      http.get('*/resources/monster-choices', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      }),
    )

    await new ResourceApi().getMonstersOptions(['MHW', 'MHR'])

    expect(new URL(capturedUrl!).searchParams.get('gameTitles')).toBe('MHW,MHR')
  })

  it('parses the response body into a list of monster codes (default handler)', async () => {
    const monsters = await new ResourceApi().getMonstersOptions(['MHW'])

    expect(monsters).toEqual(['rathalos', 'diablos'])
  })
})
