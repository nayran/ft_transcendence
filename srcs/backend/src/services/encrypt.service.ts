import { Injectable } from '@nestjs/common';
import * as crypto from "crypto";

@Injectable()
export class EncryptService {

    private algorithm = "aes-256-cbc"; 
    private vector = process.env.CRYPTO_VECTOR;
    private key = process.env.CRYPTO_SECURITY;
    
    constructor() {};
    
    public  encode(val: string): string {
        let cypher: crypto.Cipher = crypto.createCipheriv(this.algorithm, this.key, this.vector);
        let encryptedData = cypher.update(val, "utf-8", "hex");        
        encryptedData += cypher.final("hex");
        return encryptedData;
    }
    
    public  decode(val: string): string {
        let decypher: crypto.Decipher = crypto.createDecipheriv(this.algorithm, this.key, this.vector);
        let decryptedData = decypher.update(val, "hex", "utf-8");        
        decryptedData += decypher.final("utf-8");
        return decryptedData;   
    }
}
