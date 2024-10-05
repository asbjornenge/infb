import { router, methods } from './router.js'

// STORAGE:
// <address>/account.json
// <address>/post1.md
// <address>/post2.md

const setAccount = async (req, { address, json, send }) => {
  const account = await json()
  Kv.set(address, account)
  return send(200, account)
}

const handler = router({
    '/account': methods({ 'POST': setAccount }) 
  }, async (req, { send }) => {
    return send(200, 'Welcome to infb. This is the default endpoint') 
  }
)

export default handler; 
