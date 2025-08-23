export function generateShortCode(length = 6): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return result
}

export async function generateUniqueShortCode(checkExists: (code: string) => Promise<boolean>): Promise<string> {
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    const code = generateShortCode()
    const exists = await checkExists(code)

    if (!exists) {
      return code
    }

    attempts++
  }

  // If we can't find a unique code with 6 characters, try with 7
  const code = generateShortCode(7)
  return code
}
