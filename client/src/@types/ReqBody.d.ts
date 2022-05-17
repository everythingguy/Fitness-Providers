export default interface ReqBody {
  headers: {
    "Content-Type": "application/json";
    Accept: "application/json";
    Authorization?: string;
  };
  credentials: "include";
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
}
