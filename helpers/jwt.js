import {expressjwt} from "express-jwt"

    const authJwt = () => {
    const secret = process.env.secret;
    expressjwt({
        secret:"shhhhhhared-secret",
        algorithms: ["HS256"]
      }).unless({
        path: [
            "/api/user/login"
        ]
      })
      
}
