// STORAGE:
// <account>/account.json
// <account>/post1.md
// <account>/post2.md

const wrap = (fn, params={}) => {
  return async function(req) {
    const url = new URL(req.url)
    params.query = Object.fromEntries(url.searchParams.entries())
    params.address = req.headers.get("Referer")
    params.send = (status, payload, content_type='text/plain;charset=UTF-8', _headers={}) => {
      if (typeof payload === 'object') {
        payload = JSON.stringify(payload)
        content_type = 'application/json'
      }
      const headers = Object.assign({ 'Content-Type': content_type }, _headers)
      return new Response(payload, { status, headers })
    }
    params.json = async () => { return await req.json() } 
    params.text = async () => { return await req.text() }
    return await fn(req, params)
  }
}

function parseRoute(route) {
  const segments = route.split('/').filter(Boolean);
  const paramNames = [];
  const regexSegments = segments.map(segment => {
    if (segment.startsWith(':')) {
      paramNames.push(segment.slice(1));
      return '([^/]+)'; // Capture group for dynamic segment
    }
    return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape static segments
  });
  const regex = new RegExp(`^/${regexSegments.join('/')}/?$`); // Regex to match the entire path
  return { regex, paramNames };
}

export function router(routes, defaultHandler) {
  const _routes = Object.keys(routes).map(routePattern => {
    const { regex, paramNames } = parseRoute(routePattern);
    return { regex, paramNames, handler: routes[routePattern] };
  })
  return async function(req) {
    const url = new URL(req.url)
    const path = url.pathname
    for (const route of _routes) {
      const match = route.regex.exec(path)
      if (match) {
        const params = {}
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1]
        })
        return wrap(route.handler, params)(req)
      }
    }
    return wrap(defaultHandler)(req)
  }
}

export function methods(config) {
  return async function(req, params) {
    const fn = config[req.method]
    if (!fn) return params.send(400, 'Unsupported method')
    else return await fn(req, params)
  }
}
