import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'clipforge-yhpcl51t',
  authRequired: true
})

export default blink