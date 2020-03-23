export default function randomId() {
    const chars = `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`;
    let rand = "";
    for (let i = 0; i < 8; i++) {
        const num = Math.floor(Math.random() * chars.length);
        rand += chars[num]
    }
    return rand;
}