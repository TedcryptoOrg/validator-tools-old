import path from 'path'
import * as crypto from 'crypto'
import * as fs from 'fs'

export class Keystore {
  private readonly KEY_DIR: string = path.join(__dirname, '../../keys')
  private readonly KEY_SIZE = 256
  private readonly ITERATIONS: number = 100

  encrypt (plainText: string, password: string): string {
    const salt = crypto.randomBytes(16)
    const iv = crypto.randomBytes(16)
    const key = crypto.pbkdf2Sync(password, salt, this.ITERATIONS, this.KEY_SIZE / 8, 'sha1')

    const cipher = crypto.createCipheriv('AES-256-CBC', key, iv)
    const encryptedText = Buffer.concat([cipher.update(plainText), cipher.final()])

    return salt.toString('hex') + iv.toString('hex') + encryptedText.toString('hex')
  }

  decrypt (cipherText: string, password: string): string {
    const salt = Buffer.from(cipherText.slice(0, 32), 'hex')
    const iv = Buffer.from(cipherText.slice(32, 64), 'hex')
    const key = crypto.pbkdf2Sync(password, salt, this.ITERATIONS, this.KEY_SIZE / 8, 'sha1')

    const encrypedText = cipherText.slice(64)
    const cipher = crypto.createDecipheriv('AES-256-CBC', key, iv)
    const decryptedText = Buffer.concat([cipher.update(encrypedText, 'hex'), cipher.final()])

    return decryptedText.toString()
  }

  save (keyName: string, mnemonic: string, password: string): string {
    const filePath = path.join(this.KEY_DIR, `${keyName}.key`)
    if (fs.existsSync(filePath)) {
      throw new Error(`file ${filePath} already exists!`)
    }

    const cipherText = this.encrypt(mnemonic, password)
    fs.writeFileSync(filePath, cipherText)

    return filePath
  }

  list (): string[] {
    return fs.readdirSync(this.KEY_DIR);
  }

  load (keyName: string, password: string): string {
    const filePath = path.join(this.KEY_DIR, `${keyName}.key`)
    if (!fs.existsSync(filePath)) {
      throw new Error(`file ${filePath} does not exist!`)
    }

    const cipherText = fs.readFileSync(filePath, 'utf8')

    return this.decrypt(cipherText, password)
  }

  remove (keyName: string): void {
    const filePath = path.join(this.KEY_DIR, `${keyName}.key`)
    if (!fs.existsSync(filePath)) {
      throw new Error(`file ${filePath} does not exist!`)
    }

    fs.unlinkSync(filePath)
  }
}

export const keystore = new Keystore()
