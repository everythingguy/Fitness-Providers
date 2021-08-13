export interface MongoResult {
    _doc: any
}

export interface User extends MongoResult {
    name: string,
    email: string,
    username: string,
    password: string,
    _id: string
}