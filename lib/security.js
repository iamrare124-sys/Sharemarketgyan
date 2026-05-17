export function verifyCronSecret(request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${secret}`) return true
  const querySecret = new URL(request.url).searchParams.get('secret')
  if (querySecret === secret) return true
  const headerSecret = request.headers.get('x-cron-secret')
  if (headerSecret === secret) return true
  return false
}

export function apiResponse(data, status = 200) {
  return Response.json(data, { status, headers: { 'Content-Type': 'application/json' } })
}
