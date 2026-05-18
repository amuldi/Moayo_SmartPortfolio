export function ok(res, data = {}, message = '요청이 성공했습니다.') {
  return res.json({
    success: true,
    data,
    message,
  })
}

export function fail(res, status, message, code = 'REQUEST_FAILED', details = undefined) {
  return res.status(status).json({
    success: false,
    error: message,
    message,
    code,
    ...(details ? { details } : {}),
  })
}
