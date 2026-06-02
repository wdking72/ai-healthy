import { SignJWT, jwtVerify } from 'jose'

// jose 要求密钥是 Uint8Array 格式（字节数组），所以要用 TextEncoder 把字符串转一下
const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function signToken(payload: { userId: string; username: string; role: string }) {

  return await new SignJWT(payload) // 创建一个新的 JWT，payload 里存用户信息
    .setProtectedHeader({ alg: 'HS256' }) // 指定加密算法 HS256（HMAC + SHA-256）
    .setExpirationTime('7d')  // 过期时间为 7 天
    .sign(secret) // 签名 JWT，返回 token
}

// 验证token
export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload as { userId: string; username: string; role: string }
}
