'use client'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'

import { getClientSideURL } from '../../utilities/getURL'

export const LivePreviewListener: React.FC = () => {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/unbound-method
  return <PayloadLivePreview refresh={router.refresh} serverURL={getClientSideURL()} />
}
