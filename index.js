import { router, methods } from './router.js'

const setAccount = async (req, { address, json, send }) => {
  const account = await json()
  Kv.set(`${address}/account.json`, account)
  return send(200, account)
}

const setPost = async (req, { id, address, text, send }) => {
  const post = await text()
  Kv.set(`${address}/${id}`, post)
  return send(200, 'Post saved') 
}

const delPost = async (req, { id, address, send }) => {
  Kv.delete(`${address}/${id}`)
  return send(200, 'Post deleted') 
}

const handler = router({
    '/account': methods({ 'POST': setAccount }),
    '/post/:id': methods({
      'POST': setPost,
      'DELETE': delPost
    }) 
  }, async (req, { send }) => {
    return send(200, 'Welcome to infb. This is the default endpoint.') 
  }
)

export default handler; 
