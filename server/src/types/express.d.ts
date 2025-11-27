import Team from "../models/Team";
import Admin from "../models/Admin";

declare global {
  namespace Express {
    interface Request {
      team?: InstanceType<typeof Team>;
      admin?: InstanceType<typeof Admin>;
    }
  }
}

export {};
